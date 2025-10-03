import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      documento, 
      email, 
      departamento, 
      deliveryMethod,
      analiseResultado = {
        partesEnvolvidas: "AutomateAI Tecnologia Ltda. e João Silva Santos",
        valor: "R$ 8.500,00 mensais",
        prazo: "Contrato por prazo indeterminado com período de experiência de 90 dias",
        clausulasImportantes: [
          "Jornada de 44 horas semanais",
          "Vale transporte: R$ 220,00",
          "Vale refeição: R$ 600,00", 
          "Plano de saúde Unimed Nacional",
          "Aviso prévio de 30 dias"
        ]
      }
    } = body

    // Criar PDF com jsPDF
    const doc = new jsPDF()
    
    // Cabeçalho
    doc.setFontSize(20)
    doc.text('RELATÓRIO DE ANÁLISE DE CONTRATO', 20, 30)
    
    doc.setFontSize(12)
    doc.text('Sistema AutomateAI - Análise Automatizada', 20, 45)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 55)
    doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, 20, 65)
    
    // Linha separadora
    doc.line(20, 75, 190, 75)
    
    // Informações do documento
    doc.setFontSize(14)
    doc.text('INFORMAÇÕES DO DOCUMENTO', 20, 90)
    
    doc.setFontSize(11)
    doc.text(`Documento analisado: ${documento}`, 20, 105)
    doc.text(`Departamento solicitante: ${departamento}`, 20, 115)
    doc.text(`Email do responsável: ${email}`, 20, 125)
    doc.text(`Método de entrega: ${deliveryMethod === 'email' ? 'Email' : 'Download'}`, 20, 135)
    
    // Partes Envolvidas
    doc.setFontSize(14)
    doc.text('PARTES ENVOLVIDAS', 20, 155)
    doc.setFontSize(11)
    doc.text(analiseResultado.partesEnvolvidas, 20, 170)
    
    // Valor
    doc.setFontSize(14)
    doc.text('VALOR', 20, 190)
    doc.setFontSize(11)
    doc.text(analiseResultado.valor, 20, 205)
    
    // Prazo
    doc.setFontSize(14)
    doc.text('PRAZO', 20, 225)
    doc.setFontSize(11)
    const prazoText = doc.splitTextToSize(analiseResultado.prazo, 170)
    doc.text(prazoText, 20, 240)
    
    // Cláusulas Importantes
    doc.setFontSize(14)
    doc.text('CLÁUSULAS IMPORTANTES', 20, 265)
    doc.setFontSize(11)
    
    analiseResultado.clausulasImportantes.forEach((clausula: string, index: number) => {
      doc.text(`• ${clausula}`, 20, 280 + (index * 10))
    })
    
    // Rodapé - ajustar posição baseada no número de cláusulas
    const rodapeY = 280 + (analiseResultado.clausulasImportantes.length * 10) + 20
    doc.setFontSize(8)
    doc.text('Este relatório foi gerado automaticamente pelo sistema AutomateAI', 20, rodapeY)
    doc.text('Para dúvidas, entre em contato com o departamento de RH', 20, rodapeY + 10)
    
    // Converter para buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-analise-${Date.now()}.pdf"`
      }
    })

  } catch (error) {
    console.error('Erro na geração do PDF:', error)
    return NextResponse.json(
      { error: 'Erro interno na geração do PDF' },
      { status: 500 }
    )
  }
}
