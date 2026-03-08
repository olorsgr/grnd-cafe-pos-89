import type { MenuItem } from "@/data/menu";

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "online";
  createdAt: Date;
}
