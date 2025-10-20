// Wrapper para cargar Playwright dinámicamente y reducir el tamaño del bundle
import type { Browser, BrowserContext, Page } from 'playwright';

export interface PlaywrightWrapperConfig {
  browserType?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  timeout?: number;
  downloadPath?: string;
}

export interface ScrapingResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class PlaywrightWrapper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  public page: Page | null = null;
  private config: PlaywrightWrapperConfig;
  private playwright: any = null;

  constructor(config: PlaywrightWrapperConfig = {}) {
    this.config = {
      browserType: config.browserType || 'chromium',
      headless: config.headless !== undefined ? config.headless : true,
      timeout: config.timeout || 30000,
      downloadPath: config.downloadPath
    };
  }

  private async loadPlaywright() {
    if (!this.playwright) {
      this.playwright = await import('playwright');
    }
    return this.playwright;
  }

  private async ensureBrowsersInstalled() {
    try {
      const { execSync } = require('child_process');
      console.log('Verificando instalación de navegadores de Playwright...');
      
      // Intentar instalar sin dependencias del sistema para Vercel
      execSync('npx playwright install chromium', { 
        stdio: 'inherit',
        timeout: 300000, // 5 minutos timeout
        env: {
          ...process.env,
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true',
          PLAYWRIGHT_SKIP_DEPENDENCY_INSTALLATION: 'true'
        }
      });
      console.log('Navegadores de Playwright instalados correctamente');
    } catch (error) {
      console.warn('No se pudieron instalar los navegadores de Playwright automáticamente:', error);
      console.log('Continuando sin instalación automática...');
    }
  }

  async init(): Promise<void> {
    try {
      const playwright = await this.loadPlaywright();
      const { chromium, firefox, webkit } = playwright;
      
      // Configuración específica para Vercel
      const launchOptions = {
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      };
      
      switch (this.config.browserType) {
        case 'firefox':
          this.browser = await firefox.launch(launchOptions);
          break;
        case 'webkit':
          this.browser = await webkit.launch(launchOptions);
          break;
        default:
          this.browser = await chromium.launch(launchOptions);
      }

      // Configurar contexto con directorio de descarga si se especifica
      const contextOptions: any = {
        acceptDownloads: true
      };
      
      if (this.config.downloadPath) {
        // Crear el directorio si no existe
        const fs = require('fs');
        const path = require('path');
        const absolutePath = path.resolve(this.config.downloadPath);
        if (!fs.existsSync(absolutePath)) {
          fs.mkdirSync(absolutePath, { recursive: true });
        }
        
        // Configurar la ruta de descarga
        contextOptions.acceptDownloads = true;
      }

      this.context = await this.browser!.newContext(contextOptions);
      this.page = await this.context.newPage();
      
      // Configurar timeout por defecto
      if (this.page) {
        this.page.setDefaultTimeout(this.config.timeout!);
      }
    } catch (error) {
      console.error('Error initializing browser:', error);
      
      // Verificar si es un error de instalación de Playwright
      if (error instanceof Error && error.message.includes('Executable doesn\'t exist')) {
        throw new Error('Playwright browsers not installed. Please run: npx playwright install chromium');
      }
      
      throw error;
    }
  }

  async navigateTo(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('El navegador no está inicializado. Llama a init() primero.');
    }
    
    await this.page.goto(url);
  }

  async waitForSelector(selector: string, timeout?: number): Promise<void> {
    if (!this.page) {
      throw new Error('El navegador no está inicializado.');
    }
    
    await this.page.waitForSelector(selector, { timeout: timeout || this.config.timeout });
  }

  async type(selector: string, text: string): Promise<void> {
    if (!this.page) {
      throw new Error('El navegador no está inicializado.');
    }
    
    await this.page.fill(selector, text);
  }

  async click(selector: string): Promise<void> {
    if (!this.page) {
      throw new Error('El navegador no está inicializado.');
    }
    
    await this.page.click(selector);
  }

  async takeScreenshot(filename: string): Promise<void> {
    if (!this.page) {
      throw new Error('El navegador no está inicializado.');
    }
    
    await this.page.screenshot({ path: filename });
  }

  async waitForDownload(timeout: number = 30000): Promise<string> {
    if (!this.page) {
      throw new Error('El navegador no está inicializado.');
    }

    const download = await this.page.waitForEvent('download', { timeout });
    const path = require('path');
    const filePath = path.join(this.config.downloadPath || '/tmp', download.suggestedFilename() || 'download');
    
    await download.saveAs(filePath);
    
    return filePath;
  }

  getDownloadPath(): string | undefined {
    return this.config.downloadPath;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
