export type PriceType = "fijo" | "desde" | "cotizacion";

export interface Service {
  id: string;
  name: string;
  description: string;
  priceType: PriceType;
  price?: number;
  accent: string;
  photos: { id: string; url: string }[];
}

export interface AvailableSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  service?: string;
}

export interface PortfolioItem {
  id: string;
  description: string;
  imageUrl?: string;
  accent: string;
  shape: "tall" | "wide" | "square";
}
