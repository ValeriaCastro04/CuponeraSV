export const validarLuhn = (numeroTarjeta) => {
    const digits = numeroTarjeta.replace(/\D/g, "").split("").reverse();
    let sum = 0;
  
    for (let i = 0; i < digits.length; i++) {
      let digit = parseInt(digits[i], 10);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
  
    return sum % 10 === 0;
};  

/**
 * Número de tarjeta	Resultado
4242424242424242	✅ válido
4111111111111111	✅ válido
4012888888881881	✅ válido
4000056655665556	✅ válido
 */