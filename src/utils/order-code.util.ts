export function generateOrderCode(): string {
  const random = Math.floor(1000000000 + Math.random() * 9000000000);
  return `OD${random}`;
}
