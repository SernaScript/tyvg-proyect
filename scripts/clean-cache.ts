#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

const directoriesToClean = [
  '.next/cache',
  '.next/static',
  'node_modules/.cache',
  'downloads',
  'temp'
];

const filesToClean = [
  '.next/cache/webpack',
  'node_modules/.prisma/client',
  '*.log',
  '*.tmp'
];

function cleanDirectory(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
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
        fs.unlinkSync(filePath);
      }
    });
  }
}

try {
  // Limpiar directorios
  directoriesToClean.forEach(cleanDirectory);

  // Limpiar archivos
  filesToClean.forEach(cleanFiles);
} catch (error) {
  console.error('Error during cache cleanup:', error);
  process.exit(1);
}
