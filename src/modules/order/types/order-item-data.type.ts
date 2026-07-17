export type OrderItemData = {
  tourId: number;
  cityId: number;
  name: string;
  avatar: string | null;
  slug: string;
  departureDate: Date | null;
  priceNewAdult: number;
  priceNewChildren: number;
  priceNewBaby: number;
  quantityAdult: number;
  quantityChildren: number;
  quantityBaby: number;
};
