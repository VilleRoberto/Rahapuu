export const formatCurrency = (amount: number, currency: string = '€'): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

export const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^\d.,]/g, '');
  const normalizedValue = cleanValue.replace(',', '.');
  return parseFloat(normalizedValue) || 0;
};

export const formatProgress = (current: number, target: number): string => {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  return `${percentage.toFixed(1)}%`;
};

export const calculateRemaining = (current: number, target: number): number => {
  return Math.max(0, target - current);
};