#!/bin/bash

# =============================================================
#  Script de Diagnostico - Cia da Pizza
#  Uso: bash check.sh
# =============================================================

PORTA=3000
LOG="/tmp/pizza.log"

# --- Cores ---
VERDE='\033[0;32m'
VERMELHO='\033[0;31m'
AMARELO='\033[1;33m'
AZUL='\033[0;34m'
NEGRITO='\033[1m'
SEM_COR='\033[0m'

echo ""
echo -e "${NEGRITO}=========================================${SEM_COR}"
echo -e "${NEGRITO}   Cia da Pizza - Diagnostico${SEM_COR}"
echo -e "${NEGRITO}=========================================${SEM_COR}"
echo ""

# --- 1. Processos node/next rodando ---
echo -e "${AZUL}[1/5]${SEM_COR} ${NEGRITO}Processos Node/Next rodando:${SEM_COR}"
PROCS=$(ps aux | grep -E "(node server\.js|next start|next-server)" | grep -v grep)
if [ -n "$PROCS" ]; then
  echo -e "${VERDE}  SIM - Processos encontrados:${SEM_COR}"
  echo "$PROCS" | while read -r line; do
    PID=$(echo "$line" | awk '{print $2}')
    CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
    echo -e "    PID: ${NEGRITO}$PID${SEM_COR} | $CMD"
  done
else
  echo -e "${VERMELHO}  NAO - Nenhum processo node/next encontrado!${SEM_COR}"
  echo -e "  ${AMARELO}Dica: Execute 'bash deploy.sh' para iniciar o servidor${SEM_COR}"
fi
echo ""

# --- 2. Porta 3000 ---
echo -e "${AZUL}[2/5]${SEM_COR} ${NEGRITO}Porta $PORTA esta em uso:${SEM_COR}"
if command -v lsof &>/dev/null; then
  PORTA_INFO=$(lsof -i :$PORTA -P -n 2>/dev/null | grep LISTEN)
  if [ -n "$PORTA_INFO" ]; then
    echo -e "${VERDE}  SIM - Porta $PORTA esta escutando:${SEM_COR}"
    echo "$PORTA_INFO" | while read -r line; do
      echo "    $line"
    done
  else
    echo -e "${VERMELHO}  NAO - Ninguem escutando na porta $PORTA${SEM_COR}"
  fi
elif command -v ss &>/dev/null; then
  PORTA_INFO=$(ss -tlnp | grep ":$PORTA ")
  if [ -n "$PORTA_INFO" ]; then
    echo -e "${VERDE}  SIM - Porta $PORTA esta escutando:${SEM_COR}"
    echo "    $PORTA_INFO"
  else
    echo -e "${VERMELHO}  NAO - Ninguem escutando na porta $PORTA${SEM_COR}"
  fi
else
  echo -e "${AMARELO}  Nao foi possivel verificar (lsof/ss nao encontrado)${SEM_COR}"
fi
echo ""

# --- 3. Teste HTTP ---
echo -e "${AZUL}[3/5]${SEM_COR} ${NEGRITO}Teste HTTP (curl localhost:$PORTA):${SEM_COR}"
if command -v curl &>/dev/null; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$PORTA/ 2>/dev/null)
  if [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
    echo -e "${VERMELHO}  FALHOU - Servidor nao respondeu (conexao recusada)${SEM_COR}"
  elif echo "$HTTP_CODE" | grep -qE "^(200|302|304)$"; then
    echo -e "${VERDE}  SUCESSO - HTTP $HTTP_CODE${SEM_COR}"
  else
    echo -e "${AMARELO}  RESPOSTA - HTTP $HTTP_CODE (pode ser normal dependendo da rota)${SEM_COR}"
  fi
else
  echo -e "${AMARELO}  curl nao instalado. Instale com: apt install curl${SEM_COR}"
fi
echo ""

# --- 4. Log ---
echo -e "${AZUL}[4/5]${SEM_COR} ${NEGRITO}Ultimas 20 linhas do log ($LOG):${SEM_COR}"
if [ -f "$LOG" ]; then
  TAMANHO=$(wc -l < "$LOG" 2>/dev/null)
  echo -e "  (Total de linhas no log: $TAMANHO)"
  echo -e "  ${AMARELO}-------------------------------------------${SEM_COR}"
  tail -20 "$LOG" 2>/dev/null | while IFS= read -r line; do
    echo "  $line"
  done
  echo -e "  ${AMARELO}-------------------------------------------${SEM_COR}"
else
  echo -e "${VERMELHO}  Arquivo de log nao encontrado ($LOG)${SEM_COR}"
  echo -e "  ${AMARELO}O log sera criado quando o servidor iniciar via deploy.sh${SEM_COR}"
fi
echo ""

# --- 5. Firewall ---
echo -e "${AZUL}[5/5]${SEM_COR} ${NEGRITO}Status do firewall:${SEM_COR}"
FIREWALL_MOSTRADO=false

if command -v ufw &>/dev/null; then
  UFW_STATUS=$(ufw status 2>/dev/null)
  if echo "$UFW_STATUS" | grep -q "inactive"; then
    echo -e "  ${AMARELO}UFW: Inativo (todas as portas abertas por padrao)${SEM_COR}"
  else
    echo -e "  UFW ativo. Regras para porta $PORTA:"
    echo "$UFW_STATUS" | grep "$PORTA" | while read -r line; do
      echo "    $line"
    done
    if ! echo "$UFW_STATUS" | grep -q "$PORTA"; then
      echo -e "  ${VERMELHO}  ATENCAO: Porta $PORTA NAO esta nas regras do UFW!${SEM_COR}"
      echo -e "  ${AMARELO}  Execute: ufw allow $PORTA/tcp${SEM_COR}"
    fi
  fi
  FIREWALL_MOSTRADO=true
fi

if command -v iptables &>/dev/null; then
  IPTABLES_REGRA=$(iptables -L INPUT -n 2>/dev/null | grep "dpt:$PORTA")
  if [ -n "$IPTABLES_REGRA" ]; then
    echo -e "  ${VERDE}iptables: Porta $PORTA ABERTA${SEM_COR}"
    echo "    $IPTABLES_REGRA"
  else
    echo -e "  ${AMARELO}iptables: Nenhuma regra explicita para porta $PORTA${SEM_COR}"
  fi
  FIREWALL_MOSTRADO=true
fi

if [ "$FIREWALL_MOSTRADO" = false ]; then
  echo -e "  ${AMARELO}Nenhum firewall (ufw/iptables) detectado.${SEM_COR}"
fi

# --- Resumo ---
echo ""
echo -e "${NEGRITO}=========================================${SEM_COR}"
echo -e "${NEGRITO}   Informacoes do Servidor${SEM_COR}"
echo -e "${NEGRITO}=========================================${SEM_COR}"
IP_EXTERNO=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$IP_EXTERNO" ]; then
  IP_EXTERNO="(nao detectado)"
fi
echo -e "  IP: ${NEGRITO}$IP_EXTERNO${SEM_COR}"
echo -e "  Porta: ${NEGRITO}$PORTA${SEM_COR}"
echo -e "  URL: ${NEGRITO}http://${IP_EXTERNO}:${PORTA}${SEM_COR}"
echo -e "  Log: ${NEGRITO}$LOG${SEM_COR}"
echo ""
