#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

const directoriesToClean = [
  '.next/cache',
  '.next/static',
  'node_modules/.cache',
  'node_modules/.prisma/client',
  'downloads',
  'temp'
];

const filesToClean = [
  '.next/cache/webpack',
  '*.log',
  '*.tmp'
];

function cleanDirectory(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Directorio eliminado: ${dirPath}`);
    } catch (error) {
      console.warn(`No se pudo eliminar el directorio ${dirPath}:`, error instanceof Error ? error.message : String(error));
    }
  } else {
    console.log(`Directorio no existe: ${dirPath}`);
  }
}

function cleanFiles(pattern: string): void {
  const dir = path.dirname(pattern);
  const filePattern = path.basename(pattern);
  
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (file.match(filePattern.replace('*', '.*'))) {
        const filePath = path.join(dir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            fs.unlinkSync(filePath);
            console.log(`Archivo eliminado: ${filePath}`);
          } else if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
            console.log(`Directorio eliminado: ${filePath}`);
          }
        } catch (error) {
          console.warn(`No se pudo eliminar ${filePath}:`, error instanceof Error ? error.message : String(error));
        }
      }
    });
  }
}

try {
  console.log('🧹 Iniciando limpieza de caché...');
  
  // Limpiar directorios
  console.log('📁 Limpiando directorios...');
  directoriesToClean.forEach(cleanDirectory);

  // Limpiar archivos
  console.log('📄 Limpiando archivos...');
  filesToClean.forEach(cleanFiles);
  
  console.log('✅ Limpieza de caché completada exitosamente');
} catch (error) {
  console.error('❌ Error during cache cleanup:', error);
  process.exit(1);
}
