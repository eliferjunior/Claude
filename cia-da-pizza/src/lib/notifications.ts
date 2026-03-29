const DEFAULT_STORE_WHATSAPP = '5516937114444';

interface OrderItem {
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
}

interface OrderData {
  orderId?: number | null;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  orderType: 'delivery' | 'pickup' | 'dine_in';
  items: OrderItem[];
  total: number;
  notes?: string;
  storeName?: string;
}

function formatPrice(value: number): string {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function getSizeLabel(size: string | null): string {
  if (size === 'P') return 'Pequena';
  if (size === 'M') return 'Media';
  if (size === 'G') return 'Grande';
  return size ?? '';
}

function getOrderTypeLabel(orderType: string): string {
  if (orderType === 'delivery') return 'Entrega';
  if (orderType === 'pickup') return 'Retirada';
  return 'Consumo Local';
}

export function generateWhatsAppOrderLink(orderData: OrderData, storeWhatsApp?: string): string {
  const phone = storeWhatsApp || DEFAULT_STORE_WHATSAPP;

  let message = `*Pedido - Cia da Pizza*\n\n`;

  if (orderData.orderId) {
    message += `Pedido #${orderData.orderId}\n`;
  }

  message += `*Cliente:* ${orderData.customerName}\n`;
  message += `*Tipo:* ${getOrderTypeLabel(orderData.orderType)}\n`;

  if (orderData.customerPhone) {
    message += `*Telefone:* ${orderData.customerPhone}\n`;
  }

  if (orderData.orderType === 'delivery' && orderData.customerAddress) {
    message += `*Endereco:* ${orderData.customerAddress}\n`;
  }

  if (orderData.storeName) {
    message += `*Loja:* ${orderData.storeName}\n`;
  }

  message += `\n*Itens do Pedido:*\n`;
  for (const item of orderData.items) {
    const sizeLabel = getSizeLabel(item.size);
    message += `- ${item.product_name}`;
    if (sizeLabel) message += ` (${sizeLabel})`;
    message += ` x${item.quantity} - ${formatPrice(item.unit_price * item.quantity)}\n`;
  }

  message += `\n*Total: ${formatPrice(orderData.total)}*\n`;

  if (orderData.notes) {
    message += `\n*Observacoes:* ${orderData.notes}\n`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    preparing: 'Em Preparo',
    ready: 'Pronto',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };
  return labels[status] || status;
}

export function generateWhatsAppStatusLink(
  phone: string,
  orderId: number,
  status: OrderStatus,
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

  const message =
    `*Cia da Pizza - Atualizacao do Pedido*\n\n` +
    `Pedido #${orderId}\n` +
    `Status: *${getStatusLabel(status)}*\n\n` +
    `Acompanhe seu pedido em nosso site!`;

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

export { DEFAULT_STORE_WHATSAPP };
export type { OrderData, OrderItem as NotificationOrderItem, OrderStatus };
