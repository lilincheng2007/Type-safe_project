export const discountRateText = (originalPrice: number, currentPrice: number) =>
  originalPrice > 0 && currentPrice > 0 ? `${(currentPrice / originalPrice * 10).toFixed(1)}折` : '优惠价'
