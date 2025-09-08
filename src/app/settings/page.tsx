"use client"

import React, { useState, useEffect } from 'react';
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Shield, 
  Key, 
  Users, 
  Lock, 
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Database,
  Globe
} from "lucide-react"
import { SiigoCredentialsModal } from '@/components/modals/SiigoCredentialsModal'

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

interface SiigoCredentials {
  id: string;
  email: string;
  accessKey: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [siigoCredentials, setSiigoCredentials] = useState<SiigoCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [siigoLoading, setSiigoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
  const [showSiigoModal, setShowSiigoModal] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roles');
      const result = await response.json();

      if (result.success) {
        setRoles(result.data.roles);
      } else {
        console.error('Error loading roles:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      const result = await response.json();

      if (result.success) {
        setPermissions(result.data.permissions);
      } else {
        console.error('Error loading permissions:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadSiigoCredentials = async () => {
    setSiigoLoading(true);
    try {
      const response = await fetch('/api/siigo-credentials');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setSiigoCredentials(result.data);
      } else {
        console.error('Error loading SIIGO credentials:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error loading SIIGO credentials:', error);
      // No mostrar error al usuario si no hay credenciales configuradas
      if (error instanceof Error && !error.message.includes('404')) {
        console.error('Unexpected error:', error);
      }
    } finally {
      setSiigoLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadPermissions();
    loadSiigoCredentials();
  }, []);

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      'SUPER_ADMIN': 'bg-red-100 text-red-800',
      'ADMIN': 'bg-orange-100 text-orange-800',
      'ACCOUNTING': 'bg-blue-100 text-blue-800',
      'TREASURY': 'bg-green-100 text-green-800',
      'LOGISTICS': 'bg-purple-100 text-purple-800',
      'BILLING': 'bg-indigo-100 text-indigo-800',
      'VIEWER': 'bg-gray-100 text-gray-800'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      'VIEW': 'bg-blue-100 text-blue-800',
      'CREATE': 'bg-green-100 text-green-800',
      'EDIT': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
      'MANAGE': 'bg-purple-100 text-purple-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getResourceIcon = (resource: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'dashboard': <Key className="h-3 w-3" />,
      'accounting': <Shield className="h-3 w-3" />,
      'treasury': <Shield className="h-3 w-3" />,
      'logistics': <Shield className="h-3 w-3" />,
      'billing': <Shield className="h-3 w-3" />,
      'reports': <Key className="h-3 w-3" />,
      'users': <Users className="h-3 w-3" />,
      'roles': <Lock className="h-3 w-3" />,
      'settings': <Settings className="h-3 w-3" />
    };
    return icons[resource] || <Key className="h-3 w-3" />;
  };

  const handleSaveSiigoCredentials = async (credentials: any) => {
    setSiigoLoading(true);
    try {
      const response = await fetch('/api/siigo-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSiigoCredentials(result.data);
        setShowSiigoModal(false);
        console.log('Credenciales guardadas exitosamente');
      } else {
        console.error('Error saving SIIGO credentials:', result.error || 'Unknown error');
        // Aquí podrías mostrar una notificación de error
      }
    } catch (error) {
      console.error('Error saving SIIGO credentials:', error);
      // Aquí podrías mostrar una notificación de error
    } finally {
      setSiigoLoading(false);
    }
  };

  const handleDeleteSiigoCredentials = async () => {
    if (!siigoCredentials) return;
    
    setSiigoLoading(true);
    try {
      const response = await fetch('/api/siigo-credentials', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSiigoCredentials(null);
        console.log('Credenciales eliminadas exitosamente');
      } else {
        console.error('Error deleting SIIGO credentials:', result.error || 'Unknown error');
        // Aquí podrías mostrar una notificación de error
      }
    } catch (error) {
      console.error('Error deleting SIIGO credentials:', error);
      // Aquí podrías mostrar una notificación de error
    } finally {
      setSiigoLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage roles, permissions and system configurations
            </p>
          </div>
        </div>

        {/* Tabs de configuración */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="siigo" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              SIIGO API
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Tab de Roles */}
          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Role Management</CardTitle>
                    <CardDescription>
                      Manage system roles and their permissions
                    </CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading roles...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {roles.map((role) => (
                      <Card key={role.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getRoleColor(role.name)}>
                              {role.displayName}
                            </Badge>
                            <div>
                              <h3 className="font-medium">{role.displayName}</h3>
                              <p className="text-sm text-gray-600">{role.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Permisos del rol */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.map((permission) => (
                              <Badge key={permission.id} variant="outline" className="text-xs">
                                {getResourceIcon(permission.resource)}
                                {permission.resource}:{permission.action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Permisos */}
          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Permission Management</CardTitle>
                    <CardDescription>
                      Manage available system permissions
                    </CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Permission
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {permissions.map((permission) => (
                    <Card key={permission.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getActionColor(permission.action)}>
                            {permission.action}
                          </Badge>
                          <div>
                            <h3 className="font-medium">{permission.name}</h3>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getResourceIcon(permission.resource)}
                              <span className="text-xs text-gray-500">{permission.resource}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de SIIGO API */}
          <TabsContent value="siigo" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Configuración SIIGO API
                    </CardTitle>
                    <CardDescription>
                      Configura las credenciales para conectar con la API de SIIGO
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowSiigoModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {siigoCredentials ? 'Actualizar Credenciales' : 'Configurar Credenciales'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {siigoLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando configuración...</p>
                  </div>
                ) : siigoCredentials ? (
                  <div className="space-y-4">
                    <Card className="p-4 border-green-200 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-green-800">Credenciales Configuradas</h3>
                            <p className="text-sm text-green-600">Conexión activa con SIIGO API</p>
                          </div>
                        </div>
                        <Badge className={
                          siigoCredentials.platform === 'production' 
                            ? 'bg-green-100 text-green-800' 
                            : siigoCredentials.platform === 'data'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {siigoCredentials.platform === 'production' 
                            ? 'Producción' 
                            : siigoCredentials.platform === 'data'
                            ? 'Data'
                            : 'Sandbox'}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                          <p className="text-sm text-gray-600 mt-1">{siigoCredentials.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Plataforma</label>
                          <p className="text-sm text-gray-600 mt-1 capitalize">{siigoCredentials.platform}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Última Actualización</label>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(siigoCredentials.updatedAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Estado</label>
                          <p className="text-sm text-gray-600 mt-1">
                            <Badge className="bg-green-100 text-green-800">
                              {siigoCredentials.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowSiigoModal(true)}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={handleDeleteSiigoCredentials}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Database className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay credenciales configuradas</h3>
                    <p className="text-gray-600 mb-4">
                      Configura las credenciales de SIIGO API para comenzar a sincronizar datos
                    </p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowSiigoModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Configurar Credenciales
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Sistema */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  General system configurations and parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Session Configuration</h3>
                      <p className="text-sm text-gray-600">Session expiration time</p>
                      <div className="mt-2">
                        <Badge variant="outline">7 days</Badge>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Security Configuration</h3>
                      <p className="text-sm text-gray-600">Password policies</p>
                      <div className="mt-2">
                        <Badge variant="outline">Minimum 8 characters</Badge>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Sessions
                    </Button>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Configure Security
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Credenciales SIIGO */}
        <SiigoCredentialsModal
          isOpen={showSiigoModal}
          onClose={() => setShowSiigoModal(false)}
          onSave={handleSaveSiigoCredentials}
          existingCredentials={siigoCredentials}
          loading={siigoLoading}
        />
      </div>
    </MainLayout>
  )
}
