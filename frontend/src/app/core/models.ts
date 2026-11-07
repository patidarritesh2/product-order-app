export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}
export type ProductInput = Omit<Product, 'id'>;

export interface User {
  id: number;
  username: string;
}
export interface AuthResponse {
  token: string;
  user: User;
}

export interface Order {
  orderId: number;
  userId: number;
  productIds: string[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Weather {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  time: string;
}
