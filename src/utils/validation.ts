export const validateAmount = (amount: string): boolean => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 10000;
};

export const validateGoalName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateTaskTitle = (title: string): boolean => {
  return title.trim().length >= 2 && title.trim().length <= 100;
};

export const validatePinCode = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};

export const validateUserName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 30;
};

export const formatAmountInput = (value: string): string => {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.,]/g, '');
  // Replace comma with dot
  const normalized = cleaned.replace(',', '.');
  // Ensure only one decimal point
  const parts = normalized.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].substring(0, 2);
  }
  return normalized;
};