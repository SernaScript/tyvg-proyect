import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

export interface FlypassExcelRow {
  Estado: string;
  Tipo: string;
  Creacion: string;
  Documento: string;
  Relacionado?: string;
  'C.Area'?: string;
  Placa: string;
  Peaje: string;
  Categoria: string;
  'F.Paso': string;
  Transaccion: string;
  Subtotal: number;
  Impuesto?: number;
  Total: number;
  CUFE: string;
  tascode: string;
  descripcion: string;
  NIT: string;
}

export interface MappedFlypassData {
  cufe: string;
  status: string;
  documentType: string;
  creationDate: Date;
  documentNumber: string;
  relatedDocument?: string;
  costCenter?: string;
  licensePlate: string;
  tollName: string;
  vehicleCategory: string;
  passageDate: Date;
  transactionId: string;
  subtotal: number;
  tax?: number;
  total: number;
  tascode: string;
  description: string;
  companyNit: string;
  accounted: boolean;
}

export class FlypassDataMapper {
  
  /**
   * Mapea una fila del Excel a la estructura de la base de datos
   */
  static mapExcelRowToDatabase(row: FlypassExcelRow): MappedFlypassData {
    return {
      cufe: row.CUFE,
      status: row.Estado,
      documentType: row.Tipo,
      creationDate: this.parseCreationDate(row.Creacion),
      documentNumber: row.Documento,
      relatedDocument: row.Relacionado || undefined,
      costCenter: row['C.Area'] || undefined,
      licensePlate: row.Placa,
      tollName: row.Peaje,
      vehicleCategory: row.Categoria,
      passageDate: this.parsePassageDate(row['F.Paso']),
      transactionId: row.Transaccion,
      subtotal: row.Subtotal,
      tax: row.Impuesto || undefined,
      total: row.Total,
      tascode: row.tascode,
      description: row.descripcion,
      companyNit: row.NIT,
      accounted: false // Por defecto false para nuevos registros
    };
  }

  /**
   * Parsea la fecha de creación del formato "YYYY-MM-DD HH:MM:SS" a Date
   * Solo toma la parte de la fecha, ignorando la hora
   */
  private static parseCreationDate(dateString: string): Date {
    try {
      // Extraer solo la parte de la fecha (antes del espacio)
      const datePart = dateString.split(' ')[0];
      return new Date(datePart);
    } catch (error) {
      console.error('Error parsing creation date:', dateString, error);
      return new Date();
    }
  }

  /**
   * Parsea la fecha del paso del formato "DD/MM/YYYY HH:MM:SS" a Date
   */
  private static parsePassageDate(dateString: string): Date {
    try {
      // Formato: "02/01/2025 09:21:57"
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      
      // Crear fecha en formato YYYY-MM-DD
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      return new Date(isoDate);
    } catch (error) {
      console.error('Error parsing passage date:', dateString, error);
      return new Date();
    }
  }

  /**
   * Procesa un archivo Excel de Flypass y lo mapea a la estructura de la base de datos
   */
  static async processExcelFile(filePath: string): Promise<{
    success: boolean;
    totalRows: number;
    processedRows: number;
    errorRows: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processedRows = 0;
    let errorRows = 0;

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('El archivo no existe: ' + filePath);
      }

      // Crear copia temporal para evitar conflictos de acceso
      const tempFilePath = filePath.replace('.xlsx', `_temp_${Date.now()}.xlsx`);
      fs.copyFileSync(filePath, tempFilePath);
      
      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.readFile(tempFilePath);
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {}
        workbook = XLSX.readFile(filePath);
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON con headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('El archivo no contiene datos válidos');
      }

      // Obtener headers (primera fila)
      const headers = jsonData[0] as string[];
      console.log('📋 Headers encontrados:', headers);

      // Convertir filas a objetos con headers como claves
      const rows: FlypassExcelRow[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (row && row.length > 0) {
          const rowObj: any = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index];
          });
          
          // Solo procesar filas que tengan CUFE (filtro principal)
          if (rowObj.CUFE) {
            rows.push(rowObj as FlypassExcelRow);
          }
        }
      }

      console.log(`📊 Total de filas con CUFE: ${rows.length}`);

      // Procesar cada fila
      for (const row of rows) {
        try {
          const mappedData = this.mapExcelRowToDatabase(row);
          
          // Insertar o actualizar en la base de datos
          await prisma.flypassData.upsert({
            where: { cufe: mappedData.cufe },
            update: mappedData,
            create: mappedData
          });
          
          processedRows++;
          
          if (processedRows % 50 === 0) {
            console.log(`📈 Procesadas ${processedRows} filas...`);
          }
          
        } catch (error) {
          errorRows++;
          const errorMsg = `Error procesando fila con CUFE ${row.CUFE}: ${error}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log(`✅ Procesamiento completado: ${processedRows} filas procesadas, ${errorRows} errores`);

      return {
        success: true,
        totalRows: rows.length,
        processedRows,
        errorRows,
        errors
      };

    } catch (error) {
      console.error('❌ Error procesando archivo Excel:', error);
      return {
        success: false,
        totalRows: 0,
        processedRows: 0,
        errorRows: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  /**
   * Obtiene estadísticas de los datos de Flypass en la base de datos
   */
  static async getStatistics() {
    try {
      const totalRecords = await prisma.flypassData.count();
      const byStatus = await prisma.flypassData.groupBy({
        by: ['status'],
        _count: { status: true }
      });
      const byDocumentType = await prisma.flypassData.groupBy({
        by: ['documentType'],
        _count: { documentType: true }
      });
      const byToll = await prisma.flypassData.groupBy({
        by: ['tollName'],
        _count: { tollName: true }
      });

      return {
        totalRecords,
        byStatus,
        byDocumentType,
        byToll
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }
}

export default FlypassDataMapper;
