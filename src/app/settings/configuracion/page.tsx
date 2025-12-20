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
  X
} from "lucide-react"
import { CreateRoleModal } from '@/components/modals/CreateRoleModal';
import { EditRoleModal } from '@/components/modals/EditRoleModal';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionAction } from '@/types/auth';

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

export default function ConfiguracionPage() {
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Verificar permisos
  const canCreateRoles = hasPermission('roles', PermissionAction.CREATE);
  const canEditRoles = hasPermission('roles', PermissionAction.EDIT);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roles');
      const result = await response.json();

      if (result.success) {
        setRoles(result.data.roles);
      } else {
        console.error('Error cargando roles:', result.error);
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
        console.error('Error cargando permisos:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleRoleCreated = () => {
    loadRoles();
  };

  const handleRoleUpdated = () => {
    loadRoles();
  };

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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configuración del Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gestiona roles, permisos y configuraciones del sistema
            </p>
          </div>
        </div>

        {/* Tabs de configuración */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Permisos
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
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
                  {canCreateRoles && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Rol
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando roles...</p>
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
                            {canEditRoles && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditRole(role)}
                                title="Editar rol"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            {!canEditRoles && (
                              <span className="text-sm text-gray-400">Sin permisos</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Permisos del rol */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Permisos:</h4>
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

          {/* Tab de Sistema */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Configuraciones generales y parámetros del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Configuración de Sesiones</h3>
                      <p className="text-sm text-gray-600">Tiempo de expiración de sesiones</p>
                      <div className="mt-2">
                        <Badge variant="outline">7 días</Badge>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Configuración de Seguridad</h3>
                      <p className="text-sm text-gray-600">Políticas de contraseñas</p>
                      <div className="mt-2">
                        <Badge variant="outline">Mínimo 8 caracteres</Badge>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar Sesiones
                    </Button>
                    <Button variant="outline">
                      <Lock className="h-4 w-4 mr-2" />
                      Configurar Seguridad
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de crear rol */}
        {canCreateRoles && (
          <CreateRoleModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onRoleCreated={handleRoleCreated}
          />
        )}

        {/* Modal de editar rol */}
        {canEditRoles && (
          <EditRoleModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRole(null);
            }}
            onRoleUpdated={handleRoleUpdated}
            role={selectedRole}
          />
        )}
      </div>
    </MainLayout>
  )
}
