const MOV_ESSENCIA_WHATSAPP_NUMBER = "5511953070513";

export function movEssenciaWhatsappHref(serviceTitle: string): string {
  const text = encodeURIComponent(`Olá! Gostaria de falar sobre ${serviceTitle}.`);
  return `https://wa.me/${MOV_ESSENCIA_WHATSAPP_NUMBER}?text=${text}`;
}

