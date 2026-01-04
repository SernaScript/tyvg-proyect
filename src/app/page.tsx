"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ArrowRight,
  Shield,
  Truck,
  BarChart3,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  Package,
  Route,
  FileText,
  DollarSign
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-orange-50 selection:bg-orange-200">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-400 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 top-0 -z-10 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,#ffedd5,transparent)]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-orange-100/40 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 opacity-75 blur transition duration-200 group-hover:opacity-100"></div>
                <div className="relative w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-900">
                TYVG
              </span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50/50">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-orange-600 hover:bg-orange-700 shadow-orange-200 shadow-lg hover:shadow-orange-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  Acceder al Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50/50 px-3 py-1 text-sm text-orange-800 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
            Plataforma de Gestión Integral
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Portal de Transporte <br />
            <span className="relative whitespace-nowrap">
              <span className="absolute -inset-1 -skew-y-3 bg-orange-500/20" aria-hidden="true" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
                Estratégico
              </span>
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Gestiona tus pagos, certificaciones y viajes en una plataforma unificada.
            Diseñada para potenciar la eficiencia de proveedores y aliados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200 hover:shadow-2xl hover:shadow-orange-300 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto">
                <Lock className="mr-2 h-5 w-5" />
                Acceder al Portal
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-2 border-orange-100 bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-all duration-300 w-full sm:w-auto">
              <Users className="mr-2 h-5 w-5" />
              Solicitar Registro
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-orange-50/50 to-white/0"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Funcionalidades del Portal
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para operar eficientemente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Gestión de Pagos",
                desc: "Historial de liquidaciones y estado de pagos en tiempo real.",
                icon: DollarSign,
                color: "orange",
                items: ["Estado de pagos", "Historial detallado", "Próximos desembolsos"]
              },
              {
                title: "Registro de Viajes",
                desc: "Digitaliza tus viajes para procesos de liquidación ágiles.",
                icon: Truck,
                color: "blue",
                items: ["Registro simplificado", "Carga de documentos", "Tracking en vivo"]
              },
              {
                title: "Certificaciones",
                desc: "Gestión documental centralizada y alertas de vencimiento.",
                icon: FileText,
                color: "green",
                items: ["Validación RUNT", "Seguros y Pólizas", "Documentos legales"]
              },
              {
                title: "Inteligencia",
                desc: "Analytics y reportes para optimizar tu operación.",
                icon: BarChart3,
                color: "purple",
                items: ["Historial de servicios", "KPIs de rendimiento", "Reportes exportables"]
              }
            ].map((feature, idx) => (
              <Card key={idx} className="group relative border-0 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden ring-1 ring-gray-900/5">
                <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <CardHeader className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base text-gray-500 font-medium">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-3">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color}-400`}></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>

        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Construido para <br />
                  <span className="text-orange-600">Alta Eficiencia</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Nuestra plataforma elimina la fricción administrativa, permitiéndote enfocarte en lo que mejor sabes hacer: mover el país.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Transparencia Total",
                    desc: "Visualización clara de cada peso y cada kilómetro registrado.",
                    icon: DollarSign
                  },
                  {
                    title: "Cumplimiento Simplificado",
                    desc: "Alertas automáticas para que nunca se te venza un documento.",
                    icon: CheckCircle
                  },
                  {
                    title: "Velocidad de Procesamiento",
                    desc: "Pagos y liquidaciones en tiempo récord gracias a la automatización.",
                    icon: Clock
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 rounded-2xl hover:bg-orange-50/50 transition-colors duration-300">
                    <div className="mt-1 bg-white p-2 rounded-lg shadow-sm ring-1 ring-gray-100">
                      <item.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                  <div className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-gray-900/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-500">Pagos Puntuales</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-3xl shadow-xl text-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold">120+</div>
                    <div className="text-sm text-orange-100">Aliados Activos</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-gray-900/5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">2.5k+</div>
                    <div className="text-sm text-gray-500">Viajes Mensuales</div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-xl ring-1 ring-gray-900/5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">100%</div>
                    <div className="text-sm text-gray-500">Seguridad</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            ¿Listo para optimizar tu operación?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Únete a la red de transporte más eficiente del país. Gestión, transparencia y seguridad en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-900/20 w-full sm:w-auto">
                Acceder al Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm w-full sm:w-auto">
              Contactar Soporte
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">TYVG</span>
              </div>
              <p className="text-sm leading-relaxed">
                Tecnología y logística unidas para transformar el transporte de carga en Colombia.
              </p>
            </div>

            {[
              { title: "Plataforma", links: ["Iniciar Sesión", "Registro", "Recuperar Clave"] },
              { title: "Servicios", links: ["Gestión de Pagos", "Carga de Viajes", "Documentación"] },
              { title: "Legal", links: ["Términos de Uso", "Privacidad", "Tratamiento de Datos"] }
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-white mb-6">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-orange-500 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-900 mt-16 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} TYVG S.A.S. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
