const NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '966532903358'
export const whatsappUrl = (text = 'Hello AUVDAHL, I would like help with a fragrance.') => `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`
