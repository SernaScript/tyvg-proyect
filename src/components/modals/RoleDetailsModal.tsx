"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Shield, 
  Key, 
  Users, 
  Lock, 
  Settings,
  Database,
  Globe
} from 'lucide-react';

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

interface RoleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RoleDetailsModal({ isOpen, onClose, role }: RoleDetailsModalProps) {
  if (!role) return null;

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
      'settings': <Settings className="h-3 w-3" />,
      'database': <Database className="h-3 w-3" />,
      'system': <Globe className="h-3 w-3" />
    };
    return icons[resource] || <Key className="h-3 w-3" />;
  };

  // Agrupar permisos por recurso
  const groupedPermissions = role.permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detalles del Rol: {role.displayName}
          </DialogTitle>
          <DialogDescription>
            Información completa sobre este rol y sus permisos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica del rol */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={getRoleColor(role.name)}>
                {role.displayName}
              </Badge>
              <Badge variant={role.isActive ? "default" : "secondary"}>
                {role.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            
            {role.description && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Nombre del Rol</h4>
                <p className="text-sm text-gray-600">{role.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Total de Permisos</h4>
                <p className="text-sm text-gray-600">{role.permissions.length}</p>
              </div>
            </div>
          </div>

          {/* Permisos agrupados por recurso */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Permisos por Recurso</h4>
            <div className="space-y-3">
              {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                <div key={resource} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getResourceIcon(resource)}
                    <h5 className="font-medium text-gray-900 capitalize">{resource}</h5>
                    <Badge variant="outline" className="text-xs">
                      {permissions.length} permiso{permissions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permission) => (
                      <Badge 
                        key={permission.id} 
                        className={getActionColor(permission.action)}
                      >
                        {permission.action}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista detallada de permisos */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Lista Detallada de Permisos</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {role.permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(permission.resource)}
                    <span className="text-sm font-medium">{permission.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {permission.resource}
                    </Badge>
                    <Badge className={getActionColor(permission.action)}>
                      {permission.action}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
