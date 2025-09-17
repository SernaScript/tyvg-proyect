/**
 * Archivo de ejemplo para configurar las credenciales de Flypass
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo como 'credentials.ts'
 * 2. Reemplaza los valores con tus credenciales reales
 * 3. No subas el archivo credentials.ts al repositorio
 */

export const FLYPASS_CREDENTIALS = {
  nit: '900698993', // ⚠️ CAMBIAR POR TU NIT REAL
  password: 'tu_contraseña_aqui', // ⚠️ CAMBIAR POR TU CONTRASEÑA REAL
  startDate: '2024-01-01', // Fecha de inicio del rango
  endDate: '2024-01-31', // Fecha de fin del rango
  processToDatabase: false // true si quieres procesar automáticamente a la BD
};

export const TEST_CREDENTIALS = {
  nit: '123456789',
  password: 'password123',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  processToDatabase: false
};
