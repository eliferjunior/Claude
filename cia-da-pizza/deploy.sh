#!/bin/bash
set -e

# =============================================================
#  Script de Deploy - Cia da Pizza
#  Uso: bash deploy.sh
# =============================================================

LOG="/tmp/pizza.log"
PORTA=3000
BRANCH="claude/clarify-task-qb6qR"

# --- Cores para output ---
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
NEGRITO='\033[1m'
SEM_COR='\033[0m'

msg_info()  { echo -e "${AZUL}[INFO]${SEM_COR}  $1"; }
msg_ok()    { echo -e "${VERDE}[OK]${SEM_COR}    $1"; }
msg_erro()  { echo -e "${VERMELHO}[ERRO]${SEM_COR}  $1"; }
msg_aviso() { echo -e "${AMARELO}[AVISO]${SEM_COR} $1"; }

echo ""
echo -e "${NEGRITO}=========================================${SEM_COR}"
echo -e "${NEGRITO}   Cia da Pizza - Script de Deploy${SEM_COR}"
echo -e "${NEGRITO}=========================================${SEM_COR}"
echo ""

# --- 1. Verificar diretorio ---
msg_info "Verificando diretorio..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f "package.json" ]; then
  msg_erro "package.json nao encontrado em $SCRIPT_DIR"
  msg_erro "Execute este script de dentro da pasta cia-da-pizza"
  exit 1
fi

NOME_PROJETO=$(grep '"name"' package.json | head -1 | sed 's/.*: *"//;s/".*//')
if [ "$NOME_PROJETO" != "cia-da-pizza" ]; then
  msg_aviso "Este nao parece ser o projeto cia-da-pizza (encontrado: $NOME_PROJETO)"
  msg_aviso "Continuando mesmo assim..."
fi
msg_ok "Diretorio correto: $SCRIPT_DIR"

# --- 2. Matar processos anteriores ---
msg_info "Parando processos anteriores (node/next)..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "node.*\.next" 2>/dev/null || true
sleep 2

# Verificar se a porta esta livre
if lsof -i :$PORTA -t >/dev/null 2>&1; then
  msg_aviso "Porta $PORTA ainda ocupada. Matando processo na forca..."
  fuser -k ${PORTA}/tcp 2>/dev/null || true
  sleep 2
fi

if lsof -i :$PORTA -t >/dev/null 2>&1; then
  msg_erro "NAO foi possivel liberar a porta $PORTA. Verifique manualmente."
  msg_erro "Execute: lsof -i :$PORTA"
  exit 1
fi
msg_ok "Processos anteriores encerrados. Porta $PORTA livre."

# --- 3. Atualizar codigo ---
msg_info "Atualizando codigo (git pull $BRANCH)..."
if git pull origin "$BRANCH"; then
  msg_ok "Codigo atualizado com sucesso."
else
  msg_erro "Falha no git pull. Verifique conflitos ou conexao."
  exit 1
fi

# --- 4. Instalar dependencias ---
msg_info "Instalando dependencias (npm install)..."
if npm install --production=false 2>&1 | tail -5; then
  msg_ok "Dependencias instaladas."
else
  msg_erro "Falha ao instalar dependencias."
  exit 1
fi

# --- 5. Limpar build anterior ---
msg_info "Removendo build anterior (.next)..."
rm -rf .next
msg_ok "Build anterior removido."

# --- 6. Build ---
msg_info "Executando build (npm run build)... Isso pode demorar alguns minutos."
if npm run build 2>&1 | tail -20; then
  msg_ok "Build concluido com sucesso."
else
  msg_erro "Build FALHOU! Verifique os erros acima."
  exit 1
fi

# --- 7. Verificar se server.js existe ---
if [ ! -f "server.js" ]; then
  msg_aviso "server.js nao encontrado. Criando server.js basico..."
  cat > server.js << 'SERVEREOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Erro ao processar requisicao:', err);
      res.statusCode = 500;
      res.end('Erro interno do servidor');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Servidor rodando em http://${hostname}:${port}`);
  });
});
SERVEREOF
  msg_ok "server.js criado."
fi

# --- 8. Abrir firewall ---
msg_info "Configurando firewall para porta $PORTA..."
if command -v iptables &>/dev/null; then
  iptables -C INPUT -p tcp --dport $PORTA -j ACCEPT 2>/dev/null || \
    iptables -I INPUT -p tcp --dport $PORTA -j ACCEPT 2>/dev/null || true
fi
if command -v ufw &>/dev/null; then
  ufw allow ${PORTA}/tcp 2>/dev/null || true
fi
msg_ok "Firewall configurado."

# --- 9. Iniciar servidor ---
msg_info "Iniciando servidor (node server.js)..."
> "$LOG"  # Limpar log anterior
PORT=$PORTA nohup node server.js >> "$LOG" 2>&1 &
SERVER_PID=$!
msg_info "Servidor iniciado com PID: $SERVER_PID"

# --- 10. Aguardar e verificar ---
msg_info "Aguardando servidor ficar pronto..."
TENTATIVAS=0
MAX_TENTATIVAS=15
SERVIDOR_OK=false

while [ $TENTATIVAS -lt $MAX_TENTATIVAS ]; do
  TENTATIVAS=$((TENTATIVAS + 1))
  sleep 2

  # Verificar se o processo ainda esta rodando
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    msg_erro "Processo do servidor morreu inesperadamente!"
    echo ""
    msg_erro "=== Ultimas linhas do log ==="
    tail -30 "$LOG" 2>/dev/null || true
    exit 1
  fi

  # Tentar acessar
  if curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:$PORTA/ 2>/dev/null | grep -qE "^(200|302|304)$"; then
    SERVIDOR_OK=true
    break
  fi

  echo -n "."
done
echo ""

# --- 11. Resultado final ---
if [ "$SERVIDOR_OK" = true ]; then
  IP_EXTERNO=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [ -z "$IP_EXTERNO" ]; then
    IP_EXTERNO="SEU_IP"
  fi

  echo ""
  echo -e "${VERDE}${NEGRITO}=========================================${SEM_COR}"
  echo -e "${VERDE}${NEGRITO}   DEPLOY CONCLUIDO COM SUCESSO!${SEM_COR}"
  echo -e "${VERDE}${NEGRITO}=========================================${SEM_COR}"
  echo ""
  echo -e "  Acesse: ${NEGRITO}http://${IP_EXTERNO}:${PORTA}${SEM_COR}"
  echo ""
  echo -e "  ${NEGRITO}Credenciais:${SEM_COR}"
  echo -e "  +-----------+----------+-----------+"
  echo -e "  | Perfil    | Usuario  | Senha     |"
  echo -e "  +-----------+----------+-----------+"
  echo -e "  | Admin     | admin    | admin123  |"
  echo -e "  | Loja      | loja1    | loja123   |"
  echo -e "  +-----------+----------+-----------+"
  echo ""
  echo -e "  PID: $SERVER_PID | Log: $LOG"
  echo -e "  Para parar: ${AMARELO}kill $SERVER_PID${SEM_COR}"
  echo -e "  Para diagnostico: ${AMARELO}bash check.sh${SEM_COR}"
  echo ""
else
  echo ""
  echo -e "${VERMELHO}${NEGRITO}=========================================${SEM_COR}"
  echo -e "${VERMELHO}${NEGRITO}   DEPLOY FALHOU!${SEM_COR}"
  echo -e "${VERMELHO}${NEGRITO}=========================================${SEM_COR}"
  echo ""
  msg_erro "Servidor nao respondeu apos $((MAX_TENTATIVAS * 2)) segundos."
  echo ""
  msg_erro "=== Ultimas 30 linhas do log ($LOG) ==="
  tail -30 "$LOG" 2>/dev/null || true
  echo ""
  msg_info "Dicas para resolver:"
  echo "  1. Verifique o log completo: cat $LOG"
  echo "  2. Execute o diagnostico: bash check.sh"
  echo "  3. Tente iniciar manualmente: PORT=$PORTA node server.js"
  echo ""
  exit 1
fi
