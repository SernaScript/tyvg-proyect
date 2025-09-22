import { prisma } from '../src/lib/prisma'

async function testGeneratedEndpoints() {
  try {
    console.log('🧪 Probando endpoints de carteras generadas...\n')
    
    // Probar el endpoint de carteras generadas
    console.log('1️⃣ Probando endpoint /api/accounts-payable/generated...')
    
    const generatedRequests = await (prisma as any).siigoAccountsPayableGenerated.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            accountsPayable: true
          }
        }
      }
    })
    
    console.log(`   ✅ Carteras encontradas: ${generatedRequests.length}`)
    
    if (generatedRequests.length > 0) {
      const firstRequest = generatedRequests[0]
      console.log(`   📋 Primera cartera:`)
      console.log(`      - ID: ${firstRequest.id}`)
      console.log(`      - Fecha: ${firstRequest.createdAt}`)
      console.log(`      - Estado: ${firstRequest.status}`)
      console.log(`      - Registros: ${firstRequest.recordsProcessed}`)
      console.log(`      - Conteo relacionado: ${firstRequest._count.accountsPayable}`)
      
      // Probar el endpoint de cartera específica
      console.log('\n2️⃣ Probando endpoint /api/accounts-payable/generated/[id]...')
      
      const specificRequest = await (prisma as any).siigoAccountsPayableGenerated.findUnique({
        where: { id: firstRequest.id },
        include: {
          _count: {
            select: {
              accountsPayable: true
            }
          }
        }
      })
      
      if (specificRequest) {
        console.log(`   ✅ Cartera específica encontrada`)
        
        // Obtener los registros relacionados
        const accountsPayable = await (prisma as any).siigoAccountsPayable.findMany({
          where: { generatedRequestId: firstRequest.id },
          orderBy: [
            { dueDate: 'desc' },
            { createdAt: 'desc' }
          ]
        })
        
        console.log(`   📊 Registros relacionados: ${accountsPayable.length}`)
        
        if (accountsPayable.length > 0) {
          const firstAccount = accountsPayable[0]
          console.log(`   📋 Primer registro:`)
          console.log(`      - Prefijo: ${firstAccount.prefix}`)
          console.log(`      - Consecutivo: ${firstAccount.consecutive}`)
          console.log(`      - Proveedor: ${firstAccount.providerName}`)
          console.log(`      - Balance: $${firstAccount.balance}`)
        }
      } else {
        console.log(`   ❌ Cartera específica no encontrada`)
      }
    } else {
      console.log('   ⚠️  No hay carteras generadas para probar')
    }
    
    console.log('\n✅ Prueba de endpoints completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la prueba
testGeneratedEndpoints()
  .then(() => {
    console.log('\n🏁 Prueba completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error)
    process.exit(1)
  })
