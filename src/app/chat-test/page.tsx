import { ChatInterface } from '@/components/agent-chat/chat-interface'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/database/prisma'

export default async function ChatTestPage({
  searchParams,
}: {
  searchParams: { agentId?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Buscar agente específico ou primeiro agente do usuário
  let agent
  
  if (searchParams.agentId) {
    agent = await prisma.agent.findFirst({
      where: {
        id: searchParams.agentId,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    })
  } else {
    // Buscar primeiro agente do usuário
    agent = await prisma.agent.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // Se não tiver agente, redirecionar para criar
  if (!agent) {
    redirect('/dashboard?message=create-agent-first')
  }

  return (
    <div className="h-screen">
      <ChatInterface
        agentId={agent.id}
        agentName={agent.name}
      />
    </div>
  )
}
