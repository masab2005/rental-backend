export function validateCard(cardNumber, method) {
  const pan = String(cardNumber).trim();
  const brand = String(method).toLowerCase();

  // must be 16 digits
  if (!/^[0-9]{16}$/.test(pan)) return false;

  // detect brand from card number
  const detectedBrand = (() => {
    if (/^4/.test(pan)) return 'visa';
    if (/^(5[1-5])/.test(pan)) return 'mastercard';
    if (/^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(pan)) return 'mastercard';
    return 'unknown';
  })();

  // brand mismatch
  if (detectedBrand !== brand) return false;

  // Luhn check
  const luhnCheck = (() => {
    let sum = 0;
    let dbl = false;
    for (let i = pan.length - 1; i >= 0; i--) {
      let digit = Number(pan[i]);
      if (dbl) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  })();

  return luhnCheck;
}
