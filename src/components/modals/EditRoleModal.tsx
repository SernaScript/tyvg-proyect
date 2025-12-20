"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Shield, Edit } from 'lucide-react';
import { RoleName } from '@/types/auth';

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  permissions: Permission[];
}

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleUpdated: () => void;
  role: Role | null;
}

export function EditRoleModal({ isOpen, onClose, onRoleUpdated, role }: EditRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    isActive: true
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar permisos y datos del rol al abrir el modal
  useEffect(() => {
    if (isOpen && role) {
      loadPermissions();
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
        isActive: role.isActive
      });
      setSelectedPermissions(role.permissions.map(p => p.id));
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen, role]);

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      const result = await response.json();
      
      if (result.success) {
        setPermissions(result.data.permissions);
      } else {
        setError('Error cargando permisos: ' + result.error);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
      setError('Error de conexión al cargar permisos');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('El nombre del rol es requerido');
      return false;
    }

    if (!formData.displayName) {
      setError('El nombre para mostrar es requerido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !role) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description || null,
          isActive: formData.isActive,
          permissionIds: selectedPermissions
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Rol actualizado exitosamente.');
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          onRoleUpdated();
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Error actualizando rol');
      }
    } catch (error) {
      console.error('Error actualizando rol:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        displayName: '',
        description: '',
        isActive: true
      });
      setSelectedPermissions([]);
      setError('');
      setSuccessMessage('');
      onClose();
    }
  };

  if (!role) return null;

  // Agrupar permisos por recurso
  const permissionsByResource = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Rol
          </DialogTitle>
          <DialogDescription>
            Modifique los datos del rol y sus permisos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Rol (Enum) *</Label>
            <Select
              value={formData.name}
              onValueChange={(value) => handleInputChange('name', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nombre del rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(RoleName).map((roleName) => (
                  <SelectItem key={roleName} value={roleName}>
                    {roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Debe ser un valor del enum RoleName</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre para Mostrar *</Label>
            <Input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Ej: Administrador del Sistema"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción del rol y sus responsabilidades"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked as boolean)}
              disabled={loading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Rol activo
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Permisos</Label>
            <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
              {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
                <div key={resource} className="mb-4 last:mb-0">
                  <h4 className="font-medium text-sm mb-2 capitalize">{resource}</h4>
                  <div className="space-y-2">
                    {resourcePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                          disabled={loading}
                        />
                        <Label 
                          htmlFor={`permission-${permission.id}`} 
                          className="cursor-pointer text-sm flex-1"
                        >
                          <div className="font-medium">{permission.action}</div>
                          {permission.description && (
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Actualizar Rol
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

