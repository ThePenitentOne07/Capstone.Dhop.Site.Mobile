import { useCallback } from 'react';

export const useFormatCurrency = () => {
  const formatCurrency = useCallback((value: number) => {
    try {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    } catch {
      return `${value.toLocaleString()} đ`;
    }
  }, []);

  return { formatCurrency };
};