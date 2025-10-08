import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/database/prisma';
import { getEmailService } from '@/lib/email/email-service';

export async function POST(request: Request) {
  const session = await getServerSession({ req: request as any, ...authOptions });

  // @ts-ignore
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem enviar convites.' }, { status: 403 });
  }

  try {
    const { email } = await request.json();
    // @ts-ignore
    const organizationId = session.user.organizationId;

    if (!email) {
      return NextResponse.json({ error: 'O email é obrigatório.' }, { status: 400 });
    }

    // Verifica se o usuário já existe na organização
    const existingUser = await prisma.user.findFirst({
      where: { email, organizationId },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'Este usuário já pertence à organização.' }, { status: 409 });
    }

    // Verifica se já existe um convite pendente
    const existingInvitation = await prisma.invitation.findUnique({ where: { email } });
    if (existingInvitation) {
      return NextResponse.json({ error: 'Um convite para este email já foi enviado.' }, { status: 409 });
    }

    // Cria o convite
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Convite expira em 7 dias

    // @ts-ignore
    const invitedBy = session.user?.id;

    const invitation = await prisma.invitation.create({
      data: {
        email,
        organizationId,
        expires,
        invitedBy, // Rastrear quem convidou
      },
    });

    // Enviar email de convite real
    const emailService = getEmailService();
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    const inviteLink = `${baseUrl}/accept-invite?token=${invitation.token}`;
    
    // @ts-ignore
    const organizationName = session.user?.company || 'SimplifiqueIA';
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Você foi convidado!</h1>
          </div>
          <div class="content">
            <h2>Olá!</h2>
            <p>Você foi convidado para fazer parte da organização <strong>${organizationName}</strong> na plataforma SimplifiqueIA RH.</p>
            <p>Com o SimplifiqueIA, você poderá automatizar processos de RH usando inteligência artificial.</p>
            <p>Clique no botão abaixo para aceitar o convite e criar sua conta:</p>
            <center>
              <a href="${inviteLink}" class="button">Aceitar Convite</a>
            </center>
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Ou copie e cole este link no seu navegador:<br>
              <code style="background: #e9ecef; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px;">${inviteLink}</code>
            </p>
            <p style="margin-top: 20px; font-size: 14px; color: #999;">
              ⏰ Este convite expira em 7 dias (${expires.toLocaleDateString('pt-BR')})
            </p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>SimplifiqueIA RH - Automação Inteligente para Recursos Humanos</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await emailService.sendEmail({
      to: email,
      subject: `Convite para ${organizationName} - SimplifiqueIA RH`,
      html: emailHtml
    });

    if (!emailResult.success) {
      console.warn('⚠️ Convite criado mas email não foi enviado:', emailResult.error);
      return NextResponse.json({ 
        success: true, 
        message: `Convite criado para ${email}, mas o email não pôde ser enviado. Verifique a configuração SMTP.`,
        warning: 'Email não enviado - configure SMTP no .env.local'
      });
    }

    console.log(`✅ Convite enviado com sucesso para ${email}`);
    return NextResponse.json({ 
      success: true, 
      message: `Convite enviado com sucesso para ${email}.`,
      inviteLink: inviteLink // Útil para testes
    });

  } catch (error) {
    console.error('Falha ao enviar convite:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o convite.' }, { status: 500 });
  }
}
