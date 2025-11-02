import { ChatInterface } from '@/components/agent-chat/chat-interface'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/database/prisma'
import { notFound } from 'next/navigation'

export default async function AgentChatPage({
  params,
}: {
  params: { agentId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Buscar agente específico
  const agent = await prisma.agent.findFirst({
    where: {
      id: params.agentId,
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  })

  if (!agent) {
    notFound()
  }

  return (
    <div className="h-screen">
      <ChatInterface agentId={agent.id} agentName={agent.name} />
    </div>
  )
}
