#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function installPlaywright() {
  try {
    console.log('🚀 Iniciando instalación de Playwright...');
    
    // Verificar si ya están instalados
    const playwrightPath = path.join(process.cwd(), 'node_modules', '.playwright');
    if (fs.existsSync(playwrightPath)) {
      console.log('✅ Playwright ya está instalado');
      return;
    }

    // Instalar dependencias del sistema primero
    console.log('🔧 Instalando dependencias del sistema...');
    try {
      execSync('npx playwright install-deps chromium', {
        stdio: 'inherit',
        timeout: 300000, // 5 minutos
        env: {
          ...process.env,
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
          PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true'
        }
      });
      console.log('✅ Dependencias del sistema instaladas');
    } catch (error) {
      console.warn('⚠️ No se pudieron instalar las dependencias del sistema:', error);
    }

    // Instalar navegadores de Playwright
    console.log('📦 Instalando navegadores de Playwright...');
    execSync('npx playwright install chromium --with-deps', {
      stdio: 'inherit',
      timeout: 300000, // 5 minutos
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
        PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
        PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true'
      }
    });

    console.log('✅ Playwright instalado correctamente');
  } catch (error) {
    console.error('❌ Error instalando Playwright:', error);
    process.exit(1);
  }
}

installPlaywright();
