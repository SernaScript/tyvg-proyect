#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function installPlaywrightDeps() {
  try {
    console.log('🚀 Instalando dependencias completas de Playwright...');
    
    // Verificar si estamos en un entorno que soporta apt
    const isLinux = process.platform === 'linux';
    
    if (isLinux) {
      console.log('🐧 Detectado entorno Linux, instalando dependencias del sistema...');
      
      try {
        // Instalar dependencias específicas mencionadas en el error
        const deps = [
          'libnspr4',
          'libnss3', 
          'libgbm1',
          'libatk-bridge2.0-0',
          'libdrm2',
          'libxkbcommon0',
          'libxcomposite1',
          'libxdamage1',
          'libxrandr2',
          'libgbm1',
          'libxss1',
          'libasound2'
        ];
        
        console.log('📦 Instalando dependencias del sistema con apt...');
        execSync(`apt-get update && apt-get install -y ${deps.join(' ')}`, {
          stdio: 'inherit',
          timeout: 300000, // 5 minutos
          env: {
            ...process.env,
            DEBIAN_FRONTEND: 'noninteractive'
          }
        });
        
        console.log('✅ Dependencias del sistema instaladas con apt');
      } catch (aptError) {
        console.warn('⚠️ No se pudieron instalar dependencias con apt, intentando con playwright install-deps...');
        
        try {
          execSync('npx playwright install-deps chromium', {
            stdio: 'inherit',
            timeout: 300000,
            env: {
              ...process.env,
              PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
              PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
              PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true'
            }
          });
          console.log('✅ Dependencias instaladas con playwright install-deps');
        } catch (playwrightDepsError) {
          console.warn('⚠️ No se pudieron instalar dependencias con playwright install-deps:', playwrightDepsError);
        }
      }
    } else {
      console.log('🖥️ Entorno no-Linux detectado, usando playwright install-deps...');
      try {
        execSync('npx playwright install-deps chromium', {
          stdio: 'inherit',
          timeout: 300000,
          env: {
            ...process.env,
            PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
            PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
            PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true'
          }
        });
        console.log('✅ Dependencias instaladas');
      } catch (error) {
        console.warn('⚠️ No se pudieron instalar dependencias:', error);
      }
    }

    // Instalar navegadores
    console.log('🌐 Instalando navegadores de Playwright...');
    execSync('npx playwright install chromium --with-deps', {
      stdio: 'inherit',
      timeout: 300000,
      env: {
        ...process.env,
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0',
        PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
        PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS: 'true'
      }
    });

    console.log('✅ Instalación completa de Playwright finalizada');
  } catch (error) {
    console.error('❌ Error en la instalación de Playwright:', error);
    process.exit(1);
  }
}

installPlaywrightDeps();
