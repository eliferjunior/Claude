#!/bin/bash
# Script de deploy - Cia da Pizza
# Uso: bash deploy.sh

echo "🍕 Iniciando deploy da Cia da Pizza..."

# Parar servidor anterior
echo ">> Parando servidor anterior..."
pkill -f "next start" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
sleep 2

# Atualizar codigo
echo ">> Atualizando codigo..."
git pull origin claude/clarify-task-qb6qR

# Instalar dependencias
echo ">> Instalando dependencias..."
npm install

# Limpar build anterior
echo ">> Limpando build anterior..."
rm -rf .next

# Build
echo ">> Fazendo build..."
npm run build

if [ $? -ne 0 ]; then
  echo "ERRO: Build falhou!"
  exit 1
fi

# Abrir firewall
echo ">> Abrindo porta 3000..."
iptables -I INPUT -p tcp --dport 3000 -j ACCEPT 2>/dev/null
ufw allow 3000/tcp 2>/dev/null || true

# Iniciar servidor
echo ">> Iniciando servidor..."
HOSTNAME=0.0.0.0 PORT=3000 nohup npx next start > /tmp/pizza.log 2>&1 &

sleep 5

# Verificar
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
  echo ""
  echo "========================================="
  echo "  DEPLOY CONCLUIDO COM SUCESSO!"
  echo "  Acesse: http://$(hostname -I | awk '{print $1}'):3000"
  echo "========================================="
  echo ""
  echo "Credenciais:"
  echo "  Admin: admin / admin123"
  echo "  Loja:  loja1 / loja123"
else
  echo "ERRO: Servidor nao iniciou. Veja os logs:"
  cat /tmp/pizza.log
fi
