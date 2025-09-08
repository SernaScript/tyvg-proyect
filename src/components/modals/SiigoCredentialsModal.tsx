"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  Eye, 
  EyeOff, 
  Key, 
  Mail, 
  Globe,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';

interface SiigoCredentials {
  id?: string;
  email: string;
  accessKey: string;
  platform: string;
  isActive?: boolean;
}

interface SiigoCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: SiigoCredentials) => void;
  existingCredentials?: SiigoCredentials | null;
  loading?: boolean;
}

export function SiigoCredentialsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  existingCredentials,
  loading = false 
}: SiigoCredentialsModalProps) {
  const [formData, setFormData] = useState<SiigoCredentials>({
    email: '',
    accessKey: '',
    platform: 'sandbox'
  });
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (existingCredentials) {
      setFormData({
        email: existingCredentials.email,
        accessKey: existingCredentials.accessKey,
        platform: existingCredentials.platform
      });
      // Si hay credenciales existentes, asumimos que la conexión es válida
      setConnectionStatus('success');
      setConnectionMessage('Credenciales configuradas previamente');
    } else {
      setFormData({
        email: '',
        accessKey: '',
        platform: 'sandbox'
      });
      setConnectionStatus('idle');
      setConnectionMessage('');
    }
    setErrors({});
  }, [existingCredentials, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    if (!formData.accessKey.trim()) {
      newErrors.accessKey = 'La clave de acceso es requerida';
    }

    if (!formData.platform) {
      newErrors.platform = 'La plataforma es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof SiigoCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Resetear estado de conexión cuando cambien las credenciales
    if (field === 'email' || field === 'accessKey' || field === 'platform') {
      setConnectionStatus('idle');
      setConnectionMessage('');
    }
  };

  const testConnection = async () => {
    // Validar formulario antes de probar conexión
    if (!validateForm()) {
      return;
    }

    setTestLoading(true);
    setConnectionStatus('testing');
    setConnectionMessage('Probando conexión...');

    try {
      const response = await fetch('/api/siigo-credentials/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          accessKey: formData.accessKey,
          platform: formData.platform
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus('success');
        setConnectionMessage(result.message || 'Conexión exitosa');
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.error || 'Error de conexión');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('error');
      setConnectionMessage('Error de red al probar la conexión');
    } finally {
      setTestLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              {existingCredentials ? 'Editar Credenciales SIIGO' : 'Configurar Credenciales SIIGO'}
            </CardTitle>
            <CardDescription>
              {existingCredentials 
                ? 'Actualiza las credenciales de conexión con SIIGO API'
                : 'Configura las credenciales para conectar con SIIGO API'
              }
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="usuario@empresa.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Access Key */}
            <div className="space-y-2">
              <Label htmlFor="accessKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Clave de Acceso
              </Label>
              <div className="relative">
                <Input
                  id="accessKey"
                  type={showAccessKey ? 'text' : 'password'}
                  value={formData.accessKey}
                  onChange={(e) => handleInputChange('accessKey', e.target.value)}
                  placeholder="Ingresa tu clave de acceso"
                  className={errors.accessKey ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowAccessKey(!showAccessKey)}
                >
                  {showAccessKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.accessKey && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.accessKey}
                </div>
              )}
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Plataforma
              </Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => handleInputChange('platform', value)}
              >
                <SelectTrigger className={errors.platform ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona la plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Sandbox
                      </Badge>
                      <span>Ambiente de pruebas</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="production">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Production
                      </Badge>
                      <span>Ambiente de producción</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="data">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Data
                      </Badge>
                      <span>Entorno de producción Data</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.platform && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.platform}
                </div>
              )}
            </div>

            {/* Test Connection Status */}
            {connectionStatus !== 'idle' && (
              <div className={`border rounded-lg p-3 ${
                connectionStatus === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : connectionStatus === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center gap-2">
                  {connectionStatus === 'testing' && (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  )}
                  {connectionStatus === 'success' && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                  {connectionStatus === 'error' && (
                    <WifiOff className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    connectionStatus === 'success' 
                      ? 'text-green-800' 
                      : connectionStatus === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {connectionMessage}
                  </span>
                </div>
              </div>
            )}

            {/* Test Connection Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={testLoading || loading}
                className="flex items-center gap-2"
              >
                {testLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Probando...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4" />
                    Probar Conexión
                  </>
                )}
              </Button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Debes probar la conexión antes de guardar las credenciales</li>
                    <li>• Solo se puede configurar una conexión a la vez</li>
                    <li>• Las credenciales se almacenan de forma segura</li>
                    <li>• Usa Sandbox para pruebas, Production para uso real y Data para entorno de producción</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading || connectionStatus !== 'success'}
                title={connectionStatus !== 'success' ? 'Debes probar la conexión exitosamente antes de guardar' : ''}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {existingCredentials ? 'Actualizar' : 'Guardar'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
