"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LucideIcon } from "lucide-react"

export interface ModuleStatus {
  id: string
  name: string
  description: string
  status: 'active' | 'development' | 'planned'
  progress: number
  icon: LucideIcon
}

interface ModuleStatusCardProps {
  module: ModuleStatus
}

const statusConfig = {
  active: {
    label: 'Activo',
    color: 'bg-green-100 text-green-800 border-green-300',
    progressColor: 'bg-green-500'
  },
  development: {
    label: 'En Desarrollo',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    progressColor: 'bg-orange-500'
  },
  planned: {
    label: 'Planificado',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    progressColor: 'bg-gray-400'
  }
}

export function ModuleStatusCard({ module }: ModuleStatusCardProps) {
  const config = statusConfig[module.status]
  const Icon = module.icon

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <CardDescription className="text-sm">
                {module.description}
              </CardDescription>
            </div>
          </div>
          <Badge className={config.color}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{module.progress}%</span>
          </div>
          <Progress 
            value={module.progress} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}
