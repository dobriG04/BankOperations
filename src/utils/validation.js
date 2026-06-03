export const isEmpty = (val) => !val || String(val).trim() === '';
export const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
export const isDigits = (val, len) => /^\d+$/.test(val) && val.length === len;
export const isPositiveInt = (val) => !isEmpty(val) && Number.isInteger(Number(val)) && Number(val) > 0;
export const isPositiveNumber = (val) => !isEmpty(val) && !isNaN(val) && Number(val) > 0;
export const isNonNegativeNumber = (val) => !isEmpty(val) && !isNaN(val) && Number(val) >= 0;