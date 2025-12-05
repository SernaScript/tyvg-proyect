"use client"

import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ExecutiveDashboardPage() {
    const router = useRouter()

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/report/management')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div className={cn(
                            "p-3 rounded-lg",
                            "bg-purple-50 dark:bg-purple-900/20",
                            "border",
                            "border-purple-200 dark:border-purple-800"
                        )}>
                            <Briefcase className={cn("h-6 w-6", "text-purple-600 dark:text-purple-400")} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Dashboard Ejecutivo
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300">
                                Vista general de indicadores clave de negocio
                            </p>
                        </div>
                    </div>
                </div>

                {/* Power BI Embedded */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informe de Gerencia Siigo</CardTitle>
                        <CardDescription>
                            Análisis ejecutivo de indicadores de negocio
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full bg-gray-100 dark:bg-gray-900">
                            <iframe
                                title="1.8 Informe de gerencia siigo"
                                width="100%"
                                height="800"

                                src="https://app.powerbi.com/reportEmbed?reportId=ec4f7318-277d-4392-bc75-0f3bc11d4ae9&autoAuth=true&ctid=5ce83ca2-c085-44ec-93e7-b9e8d1107995"
                                frameBorder="0"
                                allowFullScreen={true}
                                className="w-full"
                                style={{
                                    border: 'none',
                                    minHeight: '800px'
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}

