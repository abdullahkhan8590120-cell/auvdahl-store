export const COD_FEE_SAR = 20
export type PaymentMethod = 'cod' | 'paypal' | 'stc_transfer'
export const paymentFee = (m: PaymentMethod) => (m === 'cod' ? COD_FEE_SAR : 0)
// Display-only. The server recomputes every total at order time (Phase 4).
export const orderTotal = (subtotal: number, shipping: number, m: PaymentMethod) => subtotal + shipping + paymentFee(m)
