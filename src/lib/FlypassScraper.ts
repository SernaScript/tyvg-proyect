import { PlaywrightWrapper, ScrapingResult } from './PlaywrightWrapper';
import { processFlypassExcel, ProcessResult } from './ExcelProcessor';
import { FlypassDataMapper } from './FlypassDataMapper';
import path from 'path';
import fs from 'fs';

export interface FlypassCredentials {
  nit: string;
  password: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  processToDatabase?: boolean; // Nueva opción para procesar automáticamente a la BD
}

export class FlypassScraper {
  private scraper: PlaywrightWrapper;

  constructor() {
    this.scraper = new PlaywrightWrapper({
      browserType: 'chromium',
      headless: process.env.NODE_ENV === 'production', // Headless en producción
      timeout: 30000,
      downloadPath: '/tmp' // Compatible con Vercel
    });
  }

  async scrapeFlypass(credentials: FlypassCredentials): Promise<ScrapingResult> {
    
    try {
      // PASO 1: Inicializar el navegador
      await this.scraper.init();
      
      // PASO 2: Ir a la página de Flypass
      this.scraper.navigateTo('https://clientes.flypass.com.co/');
      
      // PASO 3: Esperar y llenar el formulario de login
      await this.scraper.waitForSelector('input[name="username"]');
      await this.scraper.waitForSelector('input[name="password"]');

      await this.scraper.type('input[name="username"]', credentials.nit);
      await this.scraper.type('input[name="password"]', credentials.password);
      
      // PASO 4: Intentar hacer login con diferentes selectores
      await this.attemptLogin();
      
      
      // PASO 5: Navegar a la sección de facturas
      await this.navigateToInvoices();
      
      // PASO 6: Configurar filtros de búsqueda
      await this.configureSearchFilters(credentials.startDate, credentials.endDate);
      
      // PASO 7: Descargar resultados
      await this.downloadResults();
      
      // PASO 8: Procesar a la base de datos si está habilitado
      let processResult: ProcessResult | undefined;
      
      if (credentials.processToDatabase) {
        try {
          // Esperar un momento para que el archivo se complete de escribir
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Obtener la ruta del archivo descargado
          const downloadsDir = '/tmp';
          
          // Verificar que el directorio existe
          if (!fs.existsSync(downloadsDir)) {
            return {
              success: true,
              message: 'Scraping completado exitosamente. Archivo descargado.',
              data: {
                nit: credentials.nit,
                dateRange: `${credentials.startDate} - ${credentials.endDate}`,
                downloadTime: new Date().toISOString()
              }
            };
          }
          
          const files = fs.readdirSync(downloadsDir)
            .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
            .map(file => ({
              name: file,
              path: path.join(downloadsDir, file),
              stats: fs.statSync(path.join(downloadsDir, file))
            }))
            .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
          
          if (files.length > 0) {
            const latestFile = files[0];
            
            // Verificar que el archivo existe y es accesible
            if (!fs.existsSync(latestFile.path)) {
              return {
                success: true,
                message: 'Scraping completado exitosamente. Archivo descargado.',
                data: {
                  nit: credentials.nit,
                  dateRange: `${credentials.startDate} - ${credentials.endDate}`,
                  downloadTime: new Date().toISOString()
                }
              };
            }
            
            // Verificar que el archivo no esté siendo usado por otro proceso
            let retries = 0;
            const maxRetries = 5;
            while (retries < maxRetries) {
              try {
                // Intentar abrir el archivo para verificar que no esté bloqueado
                const testFile = fs.openSync(latestFile.path, 'r');
                fs.closeSync(testFile);
                break;
              } catch (error) {
                retries++;
                if (retries < maxRetries) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                  throw new Error('Archivo bloqueado después de múltiples intentos');
                }
              }
            }
            
            // Usar el mapeador de Flypass para migración específica
            const migrationResult = await FlypassDataMapper.processExcelFile(latestFile.path);
            
            // Convertir resultado de migración a formato ProcessResult
            processResult = {
              success: migrationResult.success,
              totalRecords: migrationResult.totalRows,
              processedRecords: migrationResult.processedRows,
              errorRecords: migrationResult.errorRows,
              errors: migrationResult.errors,
              logId: 'migration-' + Date.now()
            };
            
            // Esperar 5 segundos antes de eliminar el archivo
            if (processResult.success) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              try {
                fs.unlinkSync(latestFile.path);
              } catch (deleteError) {
              }
            }
          } else {
          }
        } catch (dbError) {
          console.error('Error processing to database:', dbError);
          // No fallar el scraping, solo reportar el error
        }
      }
      
      return {
        success: true,
        message: credentials.processToDatabase 
          ? `Scraping y procesamiento completados. ${processResult?.processedRecords || 0} registros guardados en la base de datos.`
          : 'Scraping completado exitosamente. Archivo descargado.',
        data: {
          nit: credentials.nit,
          dateRange: `${credentials.startDate} - ${credentials.endDate}`,
          downloadTime: new Date().toISOString(),
          databaseProcessing: processResult ? {
            totalRecords: processResult.totalRecords,
            processedRecords: processResult.processedRecords,
            errorRecords: processResult.errorRecords,
            logId: processResult.logId
          } : undefined
        }
      };
      
    } catch (error) {
      console.error('Error in scraper:', error);
      
      // Tomar captura de pantalla para debug
      try {
        await this.scraper.takeScreenshot(`error-debug-${Date.now()}.png`);
      } catch (screenshotError) {
        console.error('Could not take screenshot:', screenshotError);
      }
      
      return {
        success: false,
        message: 'Error durante el scraping',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
      
    } finally {
      // Siempre cerrar el navegador
      await this.scraper.close();
    }
  }

  private async attemptLogin(): Promise<void> {
    try {
      // Intento 1: Buscar por ID
      await this.scraper.waitForSelector('#btnEnterpriseLoginLogin', 5000);
      await this.scraper.click('#btnEnterpriseLoginLogin');
      return;
    } catch (error1) {
      
      try {
        // Intento 2: Buscar por type=submit
        await this.scraper.waitForSelector('button[type="submit"]', 5000);
        await this.scraper.click('button[type="submit"]');
        return;
      } catch (error2) {
        
        try {
          // Intento 3: Buscar por texto
          await this.scraper.waitForSelector('button:has-text("sesión")', 5000);
          await this.scraper.click('button:has-text("sesión")');
          return;
        } catch (error3) {
          await this.scraper.takeScreenshot('debug-no-se-encuentra-boton.png');
          throw new Error('No se pudo encontrar el botón de login');
        }
      }
    }
  }

  private async navigateToInvoices(): Promise<void> {
    // Cancelar cualquier modal que aparezca
    try {
      await this.scraper.click('button:has-text("Cancelar")');
    } catch {
      // No hacer nada si no hay modal
    }
    
    // Navegar a facturas
    await this.scraper.click('button:has-text("Facturas")');
    await this.scraper.click('a:has-text("Consulta tus facturas")');
    await this.scraper.click('#consolidatedInform');

    await this.scraper.page!.waitForTimeout(2000);

    // Cambiar a la nueva ventana si existe
    const pages = await this.scraper.page!.context().pages();

    if (pages.length > 1) {
      const nuevaVentana = pages[pages.length - 1];
      this.scraper.page = nuevaVentana;
      
    } else {
    }

    await this.scraper.page!.waitForLoadState('networkidle');
  }

  private async configureSearchFilters(startDate: string, endDate: string): Promise<void> {
    try {
      await this.scraper.waitForSelector('#docGLTipo', 10000);
      await this.scraper.page!.selectOption('#docGLTipo', 'todos');
    } catch (error) {
    }
    
    try {
      await this.scraper.page!.fill('input[title="Fecha Inicial"]', '');
      await this.scraper.page!.fill('input[title="Fecha Final"]', '');
      await this.scraper.type('input[title="Fecha Inicial"]', startDate);
      await this.scraper.type('input[title="Fecha Final"]', endDate);
      await this.scraper.page!.waitForTimeout(1000);
    } catch (error) {
      try {
        await this.scraper.page!.fill('input[name*="fechaInicial"]', startDate);
        await this.scraper.page!.fill('input[name*="fechaFinal"]', endDate);
      } catch (error2) {
        throw new Error('No se pudieron configurar las fechas de búsqueda');
      }
    }
    
    try {
      await this.scraper.waitForSelector('i[title="Buscar"]', 10000);
      await this.scraper.click('i[title="Buscar"]');
      await this.scraper.page!.waitForTimeout(3000);
    } catch (error) {
      try {
        await this.scraper.click('button:has-text("Buscar")');
        await this.scraper.page!.waitForTimeout(3000);
      } catch (error2) {
        throw new Error('No se pudo ejecutar la búsqueda');
      }
    }
  }

  private async downloadResults(): Promise<void> {
    const downloadPromise = this.scraper.page!.waitForEvent('download');
    await this.scraper.click('i[title="Descargar Listado"]');
    const download = await downloadPromise;
    
    const downloadPath = this.scraper.getDownloadPath() || './downloads';
    const fileName = download.suggestedFilename() || `flypass_${Date.now()}.xlsx`;
    const filePath = path.join(downloadPath, fileName);
    
    await download.saveAs(filePath);
  }
}

export async function processDownloadedFile(): Promise<ProcessResult | null> {
  try {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const downloadsDir = '/tmp';
    
    if (!fs.existsSync(downloadsDir)) {
      return null;
    }
    
    const files = fs.readdirSync(downloadsDir)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
      .map(file => ({
        name: file,
        path: path.join(downloadsDir, file),
        stats: fs.statSync(path.join(downloadsDir, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
    
    if (files.length === 0) {
      return null;
    }
    
    const latestFile = files[0];
    
    if (!fs.existsSync(latestFile.path)) {
      return null;
    }
    
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries) {
      try {
        const testFile = fs.openSync(latestFile.path, 'r');
        fs.closeSync(testFile);
        break;
      } catch (error) {
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          return null;
        }
      }
    }
    
    const tempFilePath = path.join(downloadsDir, `temp_${Date.now()}_${latestFile.name}`);
    let processResult: ProcessResult;
    
    try {
      fs.copyFileSync(latestFile.path, tempFilePath);
      processResult = await processFlypassExcel(tempFilePath);
      
      try {
        fs.unlinkSync(tempFilePath);
      } catch (tempDeleteError) {
      }
      
    } catch (copyError) {
      processResult = await processFlypassExcel(latestFile.path);
    }
    
    if (processResult.success) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        fs.unlinkSync(latestFile.path);
      } catch (deleteError) {
        setTimeout(() => {
          try {
            fs.unlinkSync(latestFile.path);
          } catch (retryError) {
          }
        }, 5000);
      }
    }
    
    return processResult;
    
  } catch (error) {
    console.error('Error processing file to database:', error);
    return null;
  }
}

export async function executeFlypassScraping(credentials: FlypassCredentials): Promise<ScrapingResult> {
  const scraper = new FlypassScraper();
  return await scraper.scrapeFlypass(credentials);
}
