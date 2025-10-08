import { Metadata } from "next";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade | SimplifiqueIA",
  description:
    "Política de Privacidade da SimplifiqueIA - Como coletamos, usamos e protegemos seus dados.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
          <Shield className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Política de Privacidade
        </h1>
        <p className="text-gray-300 text-lg">
          Última atualização:{" "}
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Conteúdo */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 space-y-8">
        {/* Seção 1 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">1. Introdução</h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              A SimplifiqueIA ("nós", "nosso" ou "nossa") está comprometida em
              proteger sua privacidade. Esta Política de Privacidade explica
              como coletamos, usamos, divulgamos e protegemos suas informações
              quando você usa nossa plataforma de automação de processos de RH
              com inteligência artificial.
            </p>
            <p>
              Ao usar nossos serviços, você concorda com a coleta e uso de
              informações de acordo com esta política.
            </p>
          </div>
        </section>

        {/* Seção 2 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              2. Informações que Coletamos
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <h3 className="text-xl font-semibold text-white mt-4">
              2.1 Informações Fornecidas por Você
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Dados de Cadastro:</strong> Nome, email, senha
                (criptografada), empresa, cargo, departamento
              </li>
              <li>
                <strong>Dados Profissionais:</strong> Tamanho da empresa, caso
                de uso principal, telefone, LinkedIn
              </li>
              <li>
                <strong>Documentos:</strong> Arquivos PDF, DOCX, XLSX enviados
                para processamento (contratos, currículos, etc)
              </li>
              <li>
                <strong>Conteúdo Gerado:</strong> Agentes criados,
                configurações, relatórios gerados
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">
              2.2 Informações Coletadas Automaticamente
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Dados de Uso:</strong> Páginas visitadas, tempo de uso,
                funcionalidades utilizadas
              </li>
              <li>
                <strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador,
                sistema operacional, dispositivo
              </li>
              <li>
                <strong>Cookies:</strong> Utilizamos cookies para melhorar sua
                experiência (veja seção 6)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">
              2.3 Informações de Terceiros
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>OAuth (Google):</strong> Nome, email, foto de perfil
                quando você usa login social
              </li>
              <li>
                <strong>Provedores de IA:</strong> Tokens de uso, custos de
                processamento (OpenAI, Google, Anthropic)
              </li>
            </ul>
          </div>
        </section>

        {/* Seção 3 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">
              3. Como Usamos Suas Informações
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Fornecer o Serviço:</strong> Processar documentos,
                executar agentes de IA, gerar relatórios
              </li>
              <li>
                <strong>Autenticação:</strong> Verificar sua identidade e
                gerenciar sua conta
              </li>
              <li>
                <strong>Personalização:</strong> Adaptar templates e sugestões
                baseadas no seu perfil RH
              </li>
              <li>
                <strong>Comunicação:</strong> Enviar notificações sobre
                relatórios, atualizações do sistema
              </li>
              <li>
                <strong>Melhoria do Produto:</strong> Analisar uso para melhorar
                funcionalidades
              </li>
              <li>
                <strong>Segurança:</strong> Detectar e prevenir fraudes, abusos
                e atividades ilegais
              </li>
              <li>
                <strong>Conformidade Legal:</strong> Cumprir obrigações legais e
                regulatórias
              </li>
            </ul>
          </div>
        </section>

        {/* Seção 4 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">
              4. Compartilhamento de Informações
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Não vendemos suas informações pessoais. Compartilhamos dados
              apenas nas seguintes situações:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Provedores de Serviço:</strong> OpenAI, Google AI,
                Anthropic (para processamento de IA)
              </li>
              <li>
                <strong>Infraestrutura:</strong> Vercel (hospedagem), PostgreSQL
                (banco de dados), Redis (cache)
              </li>
              <li>
                <strong>Obrigações Legais:</strong> Quando exigido por lei ou
                ordem judicial
              </li>
              <li>
                <strong>Proteção de Direitos:</strong> Para proteger nossos
                direitos, propriedade ou segurança
              </li>
              <li>
                <strong>Consentimento:</strong> Com sua permissão explícita para
                outros fins
              </li>
            </ul>
          </div>
        </section>

        {/* Seção 5 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">
              5. Segurança dos Dados
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para
              proteger seus dados:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Criptografia:</strong> Senhas criptografadas com bcrypt,
                HTTPS/TLS para transmissão
              </li>
              <li>
                <strong>Controle de Acesso:</strong> Autenticação NextAuth,
                roles (USER, ADMIN, SUPER_ADMIN)
              </li>
              <li>
                <strong>Auditoria:</strong> Logs de todas as ações críticas
                (criação, execução, exclusão)
              </li>
              <li>
                <strong>Backup:</strong> Backups regulares do banco de dados
              </li>
              <li>
                <strong>Monitoramento:</strong> Detecção de atividades suspeitas
                e tentativas de invasão
              </li>
            </ul>
            <p className="mt-4">
              <strong>Importante:</strong> Nenhum método de transmissão pela
              internet é 100% seguro. Embora nos esforcemos para proteger seus
              dados, não podemos garantir segurança absoluta.
            </p>
          </div>
        </section>

        {/* Seção 6 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">
              6. Seus Direitos (LGPD)
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem
              direito a:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Acesso:</strong> Solicitar cópia de seus dados pessoais
              </li>
              <li>
                <strong>Correção:</strong> Atualizar dados incorretos ou
                incompletos
              </li>
              <li>
                <strong>Exclusão:</strong> Solicitar exclusão de seus dados
                (direito ao esquecimento)
              </li>
              <li>
                <strong>Portabilidade:</strong> Receber seus dados em formato
                estruturado
              </li>
              <li>
                <strong>Revogação:</strong> Retirar consentimento para
                processamento de dados
              </li>
              <li>
                <strong>Oposição:</strong> Opor-se ao processamento de seus
                dados
              </li>
              <li>
                <strong>Informação:</strong> Saber com quem compartilhamos seus
                dados
              </li>
            </ul>
            <p className="mt-4">
              Para exercer seus direitos, entre em contato:{" "}
              <a
                href="mailto:suporte@simplifiqueia.com.br"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                suporte@simplifiqueia.com.br
              </a>
            </p>
          </div>
        </section>

        {/* Seção 7 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">
              7. Retenção de Dados
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Dados de Conta:</strong> Mantidos enquanto sua conta
                estiver ativa
              </li>
              <li>
                <strong>Relatórios:</strong> 30 dias após geração (configurável)
              </li>
              <li>
                <strong>Logs de Auditoria:</strong> 12 meses para conformidade
              </li>
              <li>
                <strong>Dados Financeiros:</strong> 5 anos (obrigação legal
                fiscal)
              </li>
            </ul>
            <p className="mt-4">
              Após a exclusão da conta, seus dados serão removidos em até 30
              dias, exceto quando obrigados a manter por lei.
            </p>
          </div>
        </section>

        {/* Seção 8 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">
              8. Cookies e Tecnologias Similares
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>Utilizamos cookies para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Essenciais:</strong> Autenticação, sessão, segurança
                (não podem ser desabilitados)
              </li>
              <li>
                <strong>Funcionais:</strong> Preferências de idioma, tema,
                layout
              </li>
              <li>
                <strong>Analytics:</strong> Google Analytics para entender uso
                da plataforma
              </li>
            </ul>
            <p className="mt-4">
              Você pode gerenciar cookies nas configurações do seu navegador.
            </p>
          </div>
        </section>

        {/* Seção 9 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">
              9. Alterações nesta Política
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente.
              Notificaremos você sobre mudanças significativas por email ou
              aviso na plataforma. A data de "Última atualização" no topo indica
              quando a política foi revisada pela última vez.
            </p>
          </div>
        </section>

        {/* Seção 10 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-bold text-white">10. Contato</h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Para dúvidas sobre esta Política de Privacidade ou exercer seus
              direitos:
            </p>
            <div className="bg-white/5 rounded-lg p-4 mt-4 border border-white/10">
              <p>
                <strong className="text-white">SimplifiqueIA</strong>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:suporte@simplifiqueia.com.br"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  suporte@simplifiqueia.com.br
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
