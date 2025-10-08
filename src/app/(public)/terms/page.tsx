import { Metadata } from "next";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Scale,
  DollarSign,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de Serviço | SimplifiqueIA",
  description:
    "Termos de Serviço da SimplifiqueIA - Condições de uso da plataforma.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
          <FileText className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Termos de Serviço
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
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">
              1. Aceitação dos Termos
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Bem-vindo à SimplifiqueIA! Estes Termos de Serviço ("Termos")
              regem seu acesso e uso da plataforma SimplifiqueIA ("Serviço"),
              operada por SimplifiqueIA ("nós", "nosso" ou "nossa").
            </p>
            <p>
              Ao acessar ou usar nosso Serviço, você concorda em estar vinculado
              a estes Termos. Se você não concordar com alguma parte dos Termos,
              não poderá acessar o Serviço.
            </p>
          </div>
        </section>

        {/* Seção 2 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              2. Descrição do Serviço
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              A SimplifiqueIA é uma plataforma de automação de processos de RH
              com inteligência artificial que permite:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Criar agentes de IA personalizados para automação de tarefas
              </li>
              <li>
                Processar documentos (contratos, currículos, relatórios) com IA
              </li>
              <li>Gerar relatórios profissionais automaticamente</li>
              <li>Integrar com sistemas externos via API</li>
              <li>Gerenciar fluxos de trabalho de RH</li>
            </ul>
            <p className="mt-4">
              <strong>Importante:</strong> Nosso Serviço utiliza modelos de IA
              de terceiros (OpenAI, Google, Anthropic). Não garantimos 100% de
              precisão nas análises geradas por IA.
            </p>
          </div>
        </section>

        {/* Seção 3 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">
              3. Cadastro e Conta
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <h3 className="text-xl font-semibold text-white mt-4">
              3.1 Elegibilidade
            </h3>
            <p>
              Você deve ter pelo menos 18 anos para usar o Serviço. Ao criar uma
              conta, você declara que tem capacidade legal para celebrar
              contratos vinculativos.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              3.2 Responsabilidades da Conta
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Fornecer informações precisas e completas durante o cadastro
              </li>
              <li>Manter a confidencialidade de sua senha</li>
              <li>
                Notificar-nos imediatamente sobre qualquer uso não autorizado
              </li>
              <li>Você é responsável por todas as atividades em sua conta</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">
              3.3 Contas Organizacionais
            </h3>
            <p>
              Se você criar uma conta em nome de uma organização, você declara
              ter autoridade para vincular essa organização a estes Termos.
            </p>
          </div>
        </section>

        {/* Seção 4 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">4. Uso Aceitável</h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>Você concorda em NÃO usar o Serviço para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violar leis, regulamentos ou direitos de terceiros</li>
              <li>
                Enviar conteúdo ilegal, ofensivo, discriminatório ou prejudicial
              </li>
              <li>Processar dados pessoais sem consentimento adequado</li>
              <li>
                Fazer engenharia reversa, descompilar ou tentar extrair
                código-fonte
              </li>
              <li>
                Usar bots, scrapers ou ferramentas automatizadas não autorizadas
              </li>
              <li>
                Sobrecarregar ou interferir com a infraestrutura do Serviço
              </li>
              <li>Revender ou redistribuir o Serviço sem autorização</li>
              <li>Criar contas falsas ou múltiplas para abusar do sistema</li>
            </ul>
          </div>
        </section>

        {/* Seção 5 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              5. Conteúdo do Usuário
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <h3 className="text-xl font-semibold text-white mt-4">
              5.1 Propriedade
            </h3>
            <p>
              Você mantém todos os direitos sobre o conteúdo que envia ao
              Serviço (documentos, agentes criados, configurações). Não
              reivindicamos propriedade sobre seu conteúdo.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              5.2 Licença para Operação
            </h3>
            <p>
              Ao enviar conteúdo, você nos concede uma licença mundial, não
              exclusiva, livre de royalties para processar, armazenar e
              transmitir seu conteúdo exclusivamente para fornecer o Serviço.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              5.3 Responsabilidade
            </h3>
            <p>
              Você é responsável por garantir que tem direitos legais para
              processar todos os dados enviados ao Serviço, incluindo dados
              pessoais de terceiros (ex: currículos de candidatos).
            </p>
          </div>
        </section>

        {/* Seção 6 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">
              6. Planos e Pagamentos
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <h3 className="text-xl font-semibold text-white mt-4">
              6.1 Planos Disponíveis
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Gratuito:</strong> Funcionalidades básicas com limites
                de uso
              </li>
              <li>
                <strong>Pro:</strong> Funcionalidades avançadas e limites
                maiores
              </li>
              <li>
                <strong>Enterprise:</strong> Solução customizada para grandes
                empresas
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">
              6.2 Cobrança
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Planos pagos são cobrados mensalmente ou anualmente</li>
              <li>
                Pagamentos são processados por provedores terceiros (Stripe,
                Mercado Pago)
              </li>
              <li>Você autoriza cobranças recorrentes até cancelamento</li>
              <li>Preços podem mudar com aviso prévio de 30 dias</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">
              6.3 Reembolsos
            </h3>
            <p>
              Oferecemos reembolso total se solicitado dentro de 7 dias da
              primeira cobrança. Após esse período, não há reembolsos para
              períodos parciais.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              6.4 Cancelamento
            </h3>
            <p>
              Você pode cancelar sua assinatura a qualquer momento. O acesso
              continuará até o final do período pago. Não há reembolso
              proporcional.
            </p>
          </div>
        </section>

        {/* Seção 7 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">
              7. Propriedade Intelectual
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <h3 className="text-xl font-semibold text-white mt-4">
              7.1 Nossa Propriedade
            </h3>
            <p>
              O Serviço, incluindo código, design, marca, logos e conteúdo, é de
              propriedade exclusiva da SimplifiqueIA e protegido por leis de
              propriedade intelectual.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              7.2 Licença de Uso
            </h3>
            <p>
              Concedemos a você uma licença limitada, não exclusiva,
              intransferível para usar o Serviço de acordo com estes Termos.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              7.3 Feedback
            </h3>
            <p>
              Se você nos fornecer sugestões ou feedback, podemos usá-los
              livremente sem obrigação de compensação.
            </p>
          </div>
        </section>

        {/* Seção 8 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">
              8. Limitações de Responsabilidade
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <h3 className="text-xl font-semibold text-white mt-4">
              8.1 Isenção de Garantias
            </h3>
            <p>
              O Serviço é fornecido "COMO ESTÁ" e "CONFORME DISPONÍVEL", sem
              garantias de qualquer tipo, expressas ou implícitas, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Disponibilidade ininterrupta ou livre de erros</li>
              <li>Precisão de 100% nas análises de IA</li>
              <li>Adequação a um propósito específico</li>
              <li>Segurança absoluta contra ataques</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">
              8.2 Limitação de Danos
            </h3>
            <p>
              Em nenhuma circunstância seremos responsáveis por danos indiretos,
              incidentais, especiais ou consequenciais, incluindo perda de
              lucros, dados ou oportunidades.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              8.3 Limite Máximo
            </h3>
            <p>
              Nossa responsabilidade total não excederá o valor pago por você
              nos últimos 12 meses.
            </p>
          </div>
        </section>

        {/* Seção 9 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">9. Indenização</h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Você concorda em indenizar e isentar a SimplifiqueIA de quaisquer
              reivindicações, danos, perdas ou despesas (incluindo honorários
              advocatícios) decorrentes de:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Seu uso do Serviço</li>
              <li>Violação destes Termos</li>
              <li>Violação de direitos de terceiros</li>
              <li>Conteúdo que você enviar ao Serviço</li>
            </ul>
          </div>
        </section>

        {/* Seção 10 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">
              10. Suspensão e Rescisão
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <h3 className="text-xl font-semibold text-white mt-4">
              10.1 Por Nós
            </h3>
            <p>
              Podemos suspender ou encerrar seu acesso imediatamente, sem aviso
              prévio, se:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Você violar estes Termos</li>
              <li>Houver atividade fraudulenta ou ilegal</li>
              <li>Não pagar valores devidos</li>
              <li>Por razões de segurança ou conformidade legal</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">
              10.2 Por Você
            </h3>
            <p>
              Você pode encerrar sua conta a qualquer momento através das
              configurações ou entrando em contato conosco.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">
              10.3 Efeitos da Rescisão
            </h3>
            <p>
              Após o encerramento, você perderá acesso ao Serviço e seus dados
              serão excluídos conforme nossa Política de Privacidade (geralmente
              30 dias).
            </p>
          </div>
        </section>

        {/* Seção 11 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">
              11. Alterações nos Termos
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Reservamos o direito de modificar estes Termos a qualquer momento.
              Notificaremos você sobre mudanças significativas por email ou
              aviso na plataforma com pelo menos 30 dias de antecedência.
            </p>
            <p>
              Seu uso continuado do Serviço após as mudanças constitui aceitação
              dos novos Termos.
            </p>
          </div>
        </section>

        {/* Seção 12 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-teal-400" />
            <h2 className="text-2xl font-bold text-white">
              12. Lei Aplicável e Jurisdição
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>
              Estes Termos são regidos pelas leis da República Federativa do
              Brasil. Quaisquer disputas serão resolvidas nos tribunais da
              comarca de São Paulo, com exclusão de qualquer outro, por mais
              privilegiado que seja.
            </p>
          </div>
        </section>

        {/* Seção 13 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">
              13. Disposições Gerais
            </h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Acordo Integral:</strong> Estes Termos constituem o
                acordo completo entre você e a SimplifiqueIA
              </li>
              <li>
                <strong>Renúncia:</strong> Nossa falha em exercer direitos não
                constitui renúncia
              </li>
              <li>
                <strong>Divisibilidade:</strong> Se alguma cláusula for
                inválida, as demais permanecem em vigor
              </li>
              <li>
                <strong>Cessão:</strong> Você não pode transferir seus direitos
                sem nosso consentimento
              </li>
              <li>
                <strong>Força Maior:</strong> Não somos responsáveis por falhas
                devido a eventos fora de nosso controle
              </li>
            </ul>
          </div>
        </section>

        {/* Seção 14 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">14. Contato</h2>
          </div>
          <div className="text-gray-300 space-y-4 leading-relaxed">
            <p>Para dúvidas sobre estes Termos de Serviço:</p>
            <div className="bg-white/5 rounded-lg p-4 mt-4 border border-white/10">
              <p>
                <strong className="text-white">SimplifiqueIA</strong>
              </p>
              <p>
                Suporte:{" "}
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
