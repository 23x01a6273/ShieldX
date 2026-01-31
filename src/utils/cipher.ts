export const caesarCipher = (text: string, shift: number, decrypt: boolean = false): string => {
  if (!text) return '';
  
  // Normalize shift to 0-25
  const s = decrypt ? (26 - (shift % 26)) : (shift % 26);
  
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + s) % 26) + base);
  });
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
