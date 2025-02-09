// src/utils/currencyConversion.js
export const convertToINR = (amount, currency) => {
    // Define your conversion rates here
    const rates = {
      INR: 1,
      USD: 82,      // Example: 1 USD = 82 INR
      POUNDS: 100,  // Example: 1 Pound = 100 INR
    };
    return amount * (rates[currency] || 1);
  };
  