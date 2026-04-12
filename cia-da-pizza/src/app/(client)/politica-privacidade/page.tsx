'use client';

import Link from 'next/link';

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white py-8 sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Politica de Privacidade</h1>
          <p className="mt-2 text-gray-400 text-sm">
            Em conformidade com a Lei Geral de Protecao de Dados (LGPD - Lei n. 13.709/2018)
          </p>
          <p className="mt-1 text-gray-500 text-xs">Ultima atualizacao: Abril de 2026</p>
        </div>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          {/* 1. Introducao */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Introducao</h2>
            <p>
              A <strong className="text-red-400">Cia da Pizza</strong>, localizada em Franca/SP,
              esta comprometida com a protecao da privacidade e dos dados pessoais de seus clientes,
              em conformidade com a Lei Geral de Protecao de Dados Pessoais (LGPD - Lei n.
              13.709/2018).
            </p>
            <p className="mt-2">
              Esta Politica de Privacidade descreve como coletamos, utilizamos, armazenamos e
              protegemos seus dados pessoais ao utilizar nosso site e servicos de pedidos online e
              reservas.
            </p>
          </section>

          {/* 2. Controlador de Dados */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Controlador de Dados</h2>
            <div className="bg-gray-900 rounded-xl p-4">
              <p>
                <strong>Razao Social:</strong> Cia da Pizza Ltda.
              </p>
              <p>
                <strong>Endereco:</strong> Franca/SP
              </p>
              <p>
                <strong>Contato para assuntos de privacidade:</strong>{' '}
                <a
                  href="https://wa.me/551637070904"
                  className="text-red-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp (16) 3707-0904
                </a>
              </p>
            </div>
          </section>

          {/* 3. Dados Coletados */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Dados Pessoais Coletados</h2>
            <p className="mb-3">Coletamos os seguintes dados pessoais:</p>

            <div className="space-y-3">
              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Pedidos Online</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Nome completo (obrigatorio)</li>
                  <li>Telefone (opcional)</li>
                  <li>E-mail (opcional)</li>
                  <li>Endereco de entrega (quando aplicavel)</li>
                  <li>Forma de pagamento selecionada</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Reservas de Mesa</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Nome completo (obrigatorio)</li>
                  <li>Telefone (opcional)</li>
                  <li>E-mail (opcional)</li>
                  <li>Data, horario e numero de convidados</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Dados Tecnicos</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Cookies de sessao (autenticacao)</li>
                  <li>Dados salvos localmente no navegador (localStorage)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Finalidade */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              4. Finalidade do Tratamento de Dados
            </h2>
            <p className="mb-3">Seus dados pessoais sao utilizados para:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Processamento de pedidos:</strong> preparar,
                entregar e gerenciar seus pedidos
              </li>
              <li>
                <strong className="text-gray-300">Gerenciamento de reservas:</strong> confirmar e
                organizar reservas de mesa
              </li>
              <li>
                <strong className="text-gray-300">Acompanhamento:</strong> permitir que voce
                acompanhe o status do seu pedido
              </li>
              <li>
                <strong className="text-gray-300">Comunicacao:</strong> entrar em contato sobre seu
                pedido ou reserva quando necessario
              </li>
              <li>
                <strong className="text-gray-300">Melhoria dos servicos:</strong> aprimorar nosso
                atendimento e plataforma
              </li>
            </ul>
          </section>

          {/* 5. Base Legal */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Base Legal</h2>
            <p>
              O tratamento dos seus dados pessoais e fundamentado nas seguintes bases legais da
              LGPD:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-gray-400">
              <li>
                <strong className="text-gray-300">Consentimento (Art. 7, I):</strong> ao preencher
                formularios e aceitar esta politica
              </li>
              <li>
                <strong className="text-gray-300">Execucao de contrato (Art. 7, V):</strong> para
                processar pedidos e reservas
              </li>
              <li>
                <strong className="text-gray-300">Interesse legitimo (Art. 7, IX):</strong> para
                melhorar nossos servicos
              </li>
            </ul>
          </section>

          {/* 6. Compartilhamento */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Compartilhamento de Dados</h2>
            <p>
              Seus dados pessoais <strong>nao sao vendidos</strong> a terceiros. Podemos
              compartilhar dados apenas com:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-gray-400">
              <li>Nossas unidades (lojas) para processamento de pedidos e reservas</li>
              <li>
                Prestadores de servicos de infraestrutura (hospedagem e banco de dados) sob
                obrigacoes de confidencialidade
              </li>
              <li>Autoridades competentes, quando exigido por lei</li>
            </ul>
          </section>

          {/* 7. Armazenamento */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Armazenamento e Seguranca</h2>
            <p>Adotamos medidas tecnicas e organizacionais para proteger seus dados:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-gray-400">
              <li>Criptografia de senhas com algoritmo bcrypt</li>
              <li>Cookies de sessao protegidos (httpOnly, secure, sameSite)</li>
              <li>Conexoes seguras via HTTPS</li>
              <li>Controle de acesso com autenticacao e autorizacao</li>
              <li>Headers de seguranca (CSP, X-Frame-Options, X-Content-Type-Options)</li>
            </ul>
            <p className="mt-3">
              Os dados sao armazenados pelo tempo necessario para cumprir as finalidades descritas
              ou conforme exigido por lei.
            </p>
          </section>

          {/* 8. Direitos do Titular */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              8. Seus Direitos (Art. 18 da LGPD)
            </h2>
            <p className="mb-3">Como titular dos dados, voce tem direito a:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: 'Confirmacao',
                  desc: 'Confirmar a existencia de tratamento dos seus dados',
                },
                { title: 'Acesso', desc: 'Acessar seus dados pessoais armazenados' },
                {
                  title: 'Correcao',
                  desc: 'Corrigir dados incompletos, inexatos ou desatualizados',
                },
                {
                  title: 'Eliminacao',
                  desc: 'Solicitar a exclusao dos seus dados pessoais',
                },
                {
                  title: 'Portabilidade',
                  desc: 'Solicitar a portabilidade dos seus dados',
                },
                {
                  title: 'Revogacao',
                  desc: 'Revogar o consentimento a qualquer momento',
                },
              ].map((right) => (
                <div key={right.title} className="bg-gray-900 rounded-xl p-3">
                  <h3 className="font-semibold text-red-400 text-sm">{right.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">
              Para exercer qualquer desses direitos, entre em contato pelo{' '}
              <a
                href="https://wa.me/551637070904"
                className="text-red-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp (16) 3707-0904
              </a>
              .
            </p>
          </section>

          {/* 9. Cookies */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Cookies</h2>
            <p>Utilizamos cookies estritamente necessarios para:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-gray-400">
              <li>
                <strong className="text-gray-300">Autenticacao:</strong> manter sua sessao ativa ao
                fazer login (admin/loja)
              </li>
              <li>
                <strong className="text-gray-300">Preferencias locais:</strong> salvar seus dados de
                cliente para agilizar pedidos futuros (armazenado no seu navegador)
              </li>
            </ul>
            <p className="mt-3">
              Nao utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.
            </p>
          </section>

          {/* 10. Alteracoes */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Alteracoes nesta Politica</h2>
            <p>
              Reservamo-nos o direito de atualizar esta Politica de Privacidade a qualquer momento.
              Alteracoes significativas serao comunicadas em nosso site. Recomendamos que voce
              revise esta pagina periodicamente.
            </p>
          </section>

          {/* 11. Contato */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Contato</h2>
            <div className="bg-gray-900 rounded-xl p-4">
              <p>
                Para duvidas, solicitacoes ou reclamacoes sobre o tratamento dos seus dados
                pessoais:
              </p>
              <ul className="mt-3 space-y-2 text-gray-400">
                <li>
                  WhatsApp:{' '}
                  <a
                    href="https://wa.me/551637070904"
                    className="text-red-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    (16) 3707-0904
                  </a>
                </li>
                <li>Atendimento: Segunda a Domingo, 18:00 as 23:00</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar ao Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
