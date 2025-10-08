import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/database/prisma'

/**
 * API para atualizar dados do perfil do usuário
 * Permite atualizar campos RH opcionais
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const {
      name,
      company,
      jobTitle,
      department,
      companySize,
      primaryUseCase,
      phone,
      linkedIn
    } = await request.json()

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar apenas campos fornecidos
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (company !== undefined) updateData.company = company
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle
    if (department !== undefined) updateData.department = department
    if (companySize !== undefined) updateData.companySize = companySize
    if (primaryUseCase !== undefined) updateData.primaryUseCase = primaryUseCase
    if (phone !== undefined) updateData.phone = phone
    if (linkedIn !== undefined) updateData.linkedIn = linkedIn

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        jobTitle: true,
        department: true,
        companySize: true,
        primaryUseCase: true,
        phone: true,
        linkedIn: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    })

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno ao atualizar perfil' },
      { status: 500 }
    )
  }
}

/**
 * API para buscar dados do perfil do usuário
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        jobTitle: true,
        department: true,
        companySize: true,
        primaryUseCase: true,
        phone: true,
        linkedIn: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar perfil' },
      { status: 500 }
    )
  }
}
