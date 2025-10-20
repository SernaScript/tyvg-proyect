import { NextRequest, NextResponse } from 'next/server';
import { FlypassDataMapper } from '@/lib/FlypassDataMapper';
import * as fs from 'fs';
import * as path from 'path';

// Función helper para limpiar archivos temporales
function cleanupTempFile(filePath: string): void {
  const isTempFile = filePath.includes('/tmp') && filePath.includes('flypass_');
  if (isTempFile) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Archivo temporal limpiado: ${filePath}`);
      }
    } catch (cleanupError) {
      console.error('❌ Error limpiando archivo temporal:', cleanupError);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    let filePath: string;
    let fileName: string;
    
    if (contentType?.includes('multipart/form-data')) {
      // Modo subida de archivo (FormData)
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No se ha proporcionado ningún archivo' },
          { status: 400 }
        );
      }

      // Validar que sea un archivo Excel
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        return NextResponse.json(
          { error: 'El archivo debe ser un Excel (.xlsx o .xls)' },
          { status: 400 }
        );
      }

      // Crear directorio temporal en /tmp (compatible con Vercel)
      const tempDir = '/tmp';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Guardar archivo temporalmente
      const tempFilePath = path.join(tempDir, `flypass_${Date.now()}_${file.name}`);
      
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(tempFilePath, buffer);

        // Verificar que el archivo se escribió correctamente
        if (!fs.existsSync(tempFilePath)) {
          throw new Error('El archivo temporal no se creó correctamente');
        }

        // Pequeño delay para asegurar que el archivo esté completamente escrito
        await new Promise(resolve => setTimeout(resolve, 100));

        filePath = tempFilePath;
        fileName = file.name;
        
      } catch (writeError) {
        throw new Error(`Error escribiendo archivo temporal: ${writeError instanceof Error ? writeError.message : 'Error desconocido'}`);
      }
      
    } else {
      // Modo ruta de archivo (JSON)
      try {
        const body = await request.json();
        const { filePath: providedPath, fileName: providedName } = body;
        
        if (!providedPath) {
          return NextResponse.json(
            { error: 'No se ha proporcionado la ruta del archivo' },
            { status: 400 }
          );
        }

        // Validar que el archivo existe
        if (!fs.existsSync(providedPath)) {
          return NextResponse.json(
            { error: 'El archivo no existe en la ruta especificada' },
            { status: 400 }
          );
        }

        // Validar que sea un archivo Excel
        if (!providedPath.endsWith('.xlsx') && !providedPath.endsWith('.xls')) {
          return NextResponse.json(
            { error: 'El archivo debe ser un Excel (.xlsx o .xls)' },
            { status: 400 }
          );
        }

        filePath = providedPath;
        fileName = providedName || path.basename(providedPath);
        
      } catch (jsonError) {
        throw new Error(`Error parseando JSON: ${jsonError instanceof Error ? jsonError.message : 'Error desconocido'}`);
      }
    }

    // Procesar el archivo usando el FlypassDataMapper
    try {
      const result = await FlypassDataMapper.processExcelFile(filePath);
      
      // Limpiar archivo temporal si fue creado (solo para archivos subidos)
      cleanupTempFile(filePath);
      
      return NextResponse.json({
        success: true,
        message: `Archivo procesado exitosamente`,
        data: {
          fileName: fileName,
          filePath: filePath,
          totalRows: result.totalRows,
          processedRows: result.processedRows,
          errorRows: result.errorRows,
          errors: result.errors.slice(0, 10) // Limitar errores mostrados
        }
      });
      
    } catch (mapperError) {
      // Limpiar archivo temporal en caso de error también
      cleanupTempFile(filePath);
      throw new Error(`Error en FlypassDataMapper: ${mapperError instanceof Error ? mapperError.message : 'Error desconocido'}`);
    }
    
  } catch (error) {
    console.error('Error procesando archivo Excel:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error procesando archivo Excel',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API para procesar archivos Excel de Flypass desde ruta de archivo',
    endpoints: {
      POST: 'Procesar archivo Excel de Flypass desde ruta de archivo',
      parameters: {
        filePath: 'Ruta completa del archivo Excel (.xlsx o .xls)',
        fileName: 'Nombre del archivo para mostrar (opcional)'
      }
    },
    example: {
      filePath: '/ruta/completa/al/archivo.xlsx',
      fileName: 'datos_flypass.xlsx'
    },
    expectedColumns: [
      'Estado',
      'Tipo', 
      'Creacion',
      'Documento',
      'Relacionado',
      'C.Area',
      'Placa',
      'Peaje',
      'Categoria',
      'F.Paso',
      'Transaccion',
      'Subtotal',
      'Impuesto',
      'Total',
      'CUFE',
      'tascode',
      'descripcion',
      'NIT'
    ]
  });
}
