// src/utils/currencyUtils.ts
export const getPaymentMethodInfo = (paymentMethod: any) => {
  if (!paymentMethod) return { name: 'No especificado', currency: 'USD' };
  
  if (typeof paymentMethod === 'string') {
    return { name: 'Método de pago', currency: 'USD' };
  }
  
  return {
    name: paymentMethod.name || 'Método de pago',
    currency: paymentMethod.currency || 'USD'
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (currency.toLowerCase().includes('ves') || 
      currency.toLowerCase().includes('bolivar') || 
      currency.toLowerCase().includes('bs')) {
    return `Bs ${amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};