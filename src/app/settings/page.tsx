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
import { RoleDetailsModal } from '@/components/modals/RoleDetailsModal'

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
  const [showRoleDetailsModal, setShowRoleDetailsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

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

  const handleViewRoleDetails = (role: Role) => {
    setSelectedRole(role);
    setShowRoleDetailsModal(true);
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
                    <CardTitle>Gestión de Roles</CardTitle>
                    <CardDescription>
                      Administra los roles del sistema y sus permisos
                    </CardDescription>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Rol
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando roles...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium">Rol</th>
                          <th className="text-left py-3 px-4 font-medium">Descripción</th>
                          <th className="text-left py-3 px-4 font-medium">Permisos</th>
                          <th className="text-left py-3 px-4 font-medium">Estado</th>
                          <th className="text-left py-3 px-4 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.map((role) => (
                          <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Badge className={getRoleColor(role.name)}>
                                  {role.displayName}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm text-gray-600 max-w-xs truncate">
                                {role.description || 'Sin descripción'}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-500">
                                  {role.permissions.length} permisos
                                </span>
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {role.permissions.slice(0, 3).map((permission) => (
                                    <Badge key={permission.id} variant="outline" className="text-xs">
                                      {permission.resource}
                                    </Badge>
                                  ))}
                                  {role.permissions.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{role.permissions.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={role.isActive ? "default" : "secondary"}>
                                {role.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  title="Ver detalles"
                                  onClick={() => handleViewRoleDetails(role)}
                                >
                                  <Shield className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" title="Editar">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" title="Eliminar">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                    <CardTitle>Gestión de Permisos</CardTitle>
                    <CardDescription>
                      Administra los permisos disponibles en el sistema
                    </CardDescription>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Permiso
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium">Permiso</th>
                        <th className="text-left py-3 px-4 font-medium">Recurso</th>
                        <th className="text-left py-3 px-4 font-medium">Acción</th>
                        <th className="text-left py-3 px-4 font-medium">Descripción</th>
                        <th className="text-left py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((permission) => (
                        <tr key={permission.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getResourceIcon(permission.resource)}
                              <span className="font-medium">{permission.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              {permission.resource}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getActionColor(permission.action)}>
                              {permission.action}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-600 max-w-xs truncate">
                              {permission.description || 'Sin descripción'}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" title="Editar">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" title="Eliminar">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

        {/* Modal de Detalles del Rol */}
        <RoleDetailsModal
          isOpen={showRoleDetailsModal}
          onClose={() => setShowRoleDetailsModal(false)}
          role={selectedRole}
        />
      </div>
    </MainLayout>
  )
}
