import WebScraper, { ScrapingResult } from './WebScraper';
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
  private scraper: WebScraper;

  constructor() {
    this.scraper = new WebScraper({
      browserType: 'chromium',
      headless: false, // Cambiar a true en producción
      timeout: 30000,
      downloadPath: path.join(process.cwd(), 'downloads') // Ruta absoluta
    });
  }

  async scrapeFlypass(credentials: FlypassCredentials): Promise<ScrapingResult> {
    console.log('🚀 Iniciando scraper de Flypass...');
    
    try {
      // PASO 1: Inicializar el navegador
      console.log('📱 Inicializando navegador...');
      await this.scraper.init();
      
      // PASO 2: Ir a la página de Flypass
      console.log('🌐 Navegando a Flypass...');
      this.scraper.navigateTo('https://clientes.flypass.com.co/');
      
      // PASO 3: Esperar y llenar el formulario de login
      await this.scraper.waitForSelector('input[name="username"]');
      await this.scraper.waitForSelector('input[name="password"]');

      console.log('✍️ Llenando credenciales...');
      await this.scraper.type('input[name="username"]', credentials.nit);
      await this.scraper.type('input[name="password"]', credentials.password);
      
      // PASO 4: Intentar hacer login con diferentes selectores
      console.log('🔐 Intentando hacer login...');
      await this.attemptLogin();
      
      console.log('✅ Login realizado con éxito!');
      
      // PASO 5: Navegar a la sección de facturas
      console.log('⏳ Esperando que cargue la página principal...');
      await this.navigateToInvoices();
      
      // PASO 6: Configurar filtros de búsqueda
      console.log('🔧 Configurando filtros de búsqueda...');
      await this.configureSearchFilters(credentials.startDate, credentials.endDate);
      
      // PASO 7: Descargar resultados
      console.log('📥 Iniciando descarga...');
      await this.downloadResults();
      
      // PASO 8: Procesar a la base de datos si está habilitado
      let processResult: ProcessResult | undefined;
      
      if (credentials.processToDatabase) {
        console.log('🗄️ Procesando archivo a la base de datos...');
        try {
          // Esperar un momento para que el archivo se complete de escribir
          console.log('⏳ Esperando que se complete la descarga...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Obtener la ruta del archivo descargado
          const downloadsDir = path.join(process.cwd(), 'downloads');
          
          // Verificar que el directorio existe
          if (!fs.existsSync(downloadsDir)) {
            console.warn('⚠️ Directorio de descargas no existe');
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
            console.log(`📄 Procesando archivo: ${latestFile.name}`);
            
            // Verificar que el archivo existe y es accesible
            if (!fs.existsSync(latestFile.path)) {
              console.warn('⚠️ Archivo no encontrado:', latestFile.path);
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
                  console.log(`⏳ Archivo en uso, esperando... (intento ${retries}/${maxRetries})`);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                  throw new Error('Archivo bloqueado después de múltiples intentos');
                }
              }
            }
            
            // Usar el mapeador de Flypass para migración específica
            console.log('🔄 Ejecutando migración de datos Flypass...');
            const migrationResult = await FlypassDataMapper.processExcelFile(latestFile.path);
            console.log(`✅ Migración completada: ${migrationResult.processedRows}/${migrationResult.totalRows} registros`);
            
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
              console.log('⏳ Esperando 5 segundos antes de eliminar el archivo...');
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              try {
                fs.unlinkSync(latestFile.path);
                console.log(`🗑️ Archivo Excel eliminado después de 5 segundos: ${latestFile.name}`);
              } catch (deleteError) {
                console.warn('⚠️ No se pudo eliminar el archivo Excel:', deleteError);
              }
            }
          } else {
            console.warn('⚠️ No se encontró archivo Excel para procesar');
          }
        } catch (dbError) {
          console.error('❌ Error procesando a la base de datos:', dbError);
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
      console.error('❌ Error en el scraper:', error);
      
      // Tomar captura de pantalla para debug
      try {
        await this.scraper.takeScreenshot(`error-debug-${Date.now()}.png`);
      } catch (screenshotError) {
        console.error('No se pudo tomar captura de pantalla:', screenshotError);
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
      console.log('✅ Botón encontrado con ID!');
      await this.scraper.click('#btnEnterpriseLoginLogin');
      return;
    } catch (error1) {
      console.log('❌ No se encontró con ID, probando con type=submit...');
      
      try {
        // Intento 2: Buscar por type=submit
        await this.scraper.waitForSelector('button[type="submit"]', 5000);
        console.log('✅ Botón encontrado con type=submit!');
        await this.scraper.click('button[type="submit"]');
        return;
      } catch (error2) {
        console.log('❌ No se encontró con type=submit, probando con texto...');
        
        try {
          // Intento 3: Buscar por texto
          await this.scraper.waitForSelector('button:has-text("sesión")', 5000);
          console.log('✅ Botón encontrado con texto!');
          await this.scraper.click('button:has-text("sesión")');
          return;
        } catch (error3) {
          console.log('❌ No se pudo encontrar el botón de ninguna manera');
          console.log('📸 Tomando captura para debug...');
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

    console.log('🔄 Esperando nueva ventana...');
    await this.scraper.page!.waitForTimeout(2000);

    // Cambiar a la nueva ventana si existe
    const pages = await this.scraper.page!.context().pages();
    console.log(`📊 Ventanas abiertas: ${pages.length}`);

    if (pages.length > 1) {
      const nuevaVentana = pages[pages.length - 1];
      this.scraper.page = nuevaVentana;
      
      console.log('✅ Cambiado a la nueva ventana!');
      console.log(`🌐 URL nueva ventana: ${await this.scraper.page.url()}`);
    } else {
      console.log('ℹ️ No se detectó nueva ventana, continuando...');
    }

    await this.scraper.page!.waitForLoadState('networkidle');
  }

  private async configureSearchFilters(startDate: string, endDate: string): Promise<void> {
    try {
      await this.scraper.waitForSelector('#docGLTipo', 10000);
      await this.scraper.page!.selectOption('#docGLTipo', 'todos');
    } catch (error) {
      console.warn('⚠️ No se pudo configurar tipo de documento:', error);
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
    
    const downloadsDir = path.join(process.cwd(), 'downloads');
    
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
        console.warn('⚠️ No se pudo eliminar archivo temporal:', tempDeleteError);
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
            console.warn('⚠️ No se pudo eliminar el archivo Excel:', retryError);
          }
        }, 5000);
      }
    }
    
    return processResult;
    
  } catch (error) {
    console.error('❌ Error procesando archivo a la base de datos:', error);
    return null;
  }
}

export async function executeFlypassScraping(credentials: FlypassCredentials): Promise<ScrapingResult> {
  const scraper = new FlypassScraper();
  return await scraper.scrapeFlypass(credentials);
}
