import { NextRequest, NextResponse } from 'next/server';
import { FlypassDataMapper } from '@/lib/FlypassDataMapper';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando migración de archivo Excel de Flypass...');
    
    // Verificar que existe el directorio de descargas
    const downloadsDir = path.join(process.cwd(), 'downloads');
    
    if (!fs.existsSync(downloadsDir)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se encontró el directorio de descargas' 
        },
        { status: 400 }
      );
    }

    // Buscar archivos Excel en el directorio de descargas
    const files = fs.readdirSync(downloadsDir)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
      .map(file => {
        const filePath = path.join(downloadsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => b.modified.localeCompare(a.modified));

    if (files.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se encontraron archivos Excel en el directorio de descargas' 
        },
        { status: 400 }
      );
    }

    // Usar el archivo más reciente
    const latestFile = files[0];
    console.log(`📄 Procesando archivo: ${latestFile.name}`);

    // Verificar que el archivo no esté siendo usado
    let retries = 0;
    const maxRetries = 5;
    while (retries < maxRetries) {
      try {
        const testFile = fs.openSync(latestFile.path, 'r');
        fs.closeSync(testFile);
        break;
      } catch (error) {
        retries++;
        if (retries < maxRetries) {
          console.log(`⏳ Archivo en uso, esperando... (intento ${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw new Error('Archivo bloqueado después de múltiples intentos');
        }
      }
    }

    // Ejecutar la migración
    const migrationResult = await FlypassDataMapper.processExcelFile(latestFile.path);
    
    console.log(`✅ Migración completada: ${migrationResult.processedRows}/${migrationResult.totalRows} registros`);

    // Obtener estadísticas actuales
    const stats = await FlypassDataMapper.getStatistics();
    
    const response = {
      success: migrationResult.success,
      message: migrationResult.success 
        ? `Migración completada exitosamente. ${migrationResult.processedRows} registros procesados.`
        : 'Error durante la migración',
      data: {
        fileProcessed: latestFile.name,
        totalRows: migrationResult.totalRows,
        processedRows: migrationResult.processedRows,
        errorRows: migrationResult.errorRows,
        errors: migrationResult.errors,
        statistics: stats
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido durante la migración',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Obtener estadísticas actuales
    const stats = await FlypassDataMapper.getStatistics();
    
    // Verificar archivos disponibles
    const downloadsDir = path.join(process.cwd(), 'downloads');
    let availableFiles: Array<{
      name: string;
      size: number;
      modified: string;
    }> = [];
    
    if (fs.existsSync(downloadsDir)) {
      availableFiles = fs.readdirSync(downloadsDir)
        .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
        .map(file => {
          const filePath = path.join(downloadsDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => b.modified.localeCompare(a.modified));
    }

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats,
        availableFiles: availableFiles,
        downloadsDir: downloadsDir
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo información de migración:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
