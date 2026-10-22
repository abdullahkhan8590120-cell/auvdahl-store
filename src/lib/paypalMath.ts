// Store prices are SAR. PayPal may need another currency; rate = SAR per 1 unit of that currency.
export const charge = (sar: number, rate: number) => (Math.round((sar / rate) * 100) / 100).toFixed(2)
