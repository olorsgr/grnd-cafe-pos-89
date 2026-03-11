import React, { useEffect, useMemo, useState } from "react";
import type { OrderItem } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type PaymentMethod = "cash" | "online";

interface SavedOrder {
  id: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  discount: number;
  items: OrderItem[];
}

const ORDERS_KEY = "grnd.orders";

// Helpers
const peso = (n: number) => `₱${n.toFixed(2)}`;
const orderSubtotal = (o: SavedOrder) =>
  o.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
const orderDiscountAmt = (o: SavedOrder) => orderSubtotal(o) * o.discount;
const orderTotal = (o: SavedOrder) => orderSubtotal(o) - orderDiscountAmt(o);

export default function OrderHistory() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      const parsed: SavedOrder[] = raw ? JSON.parse(raw) : [];
      setOrders(parsed);
    } catch {
      setOrders([]);
    }
  }, []);

  const visibleOrders = useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders
      .filter((o) => (methodFilter === "all" ? true : o.paymentMethod === methodFilter))
      .filter((o) => {
        if (!s) return true;
        const hay =
          `${o.id} ${o.paymentMethod} ${o.items.map((i) => i.menuItem.name).join(" ")}`.toLowerCase();
        return hay.includes(s);
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [orders, methodFilter, search]);

  const removeOne = (id: string) => {
    const next = orders.filter((o) => o.id !== id);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
    setOrders(next);
    toast.info(`Order ${id} removed.`);
  };

  const clearAll = () => {
    localStorage.removeItem(ORDERS_KEY);
    setOrders([]);
    toast.info("Order history cleared.");
  };

  const grandTotal = useMemo(
    () => visibleOrders.reduce((sum, o) => sum + orderTotal(o), 0),
    [visibleOrders],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="font-display text-3xl font-bold">Order History</h1>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order # or item…"
          className="h-9 w-64 rounded border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="ml-auto flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as any)}
            className="h-9 rounded border border-border bg-card px-3 text-sm"
          >
            <option value="all">All methods</option>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
          {orders.length > 0 && (
            <Button variant="outline" onClick={clearAll} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground">
              <th className="px-3 py-2 text-left">Order #</th>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2 text-left">Items</th>
              <th className="px-3 py-2 text-left">Payment</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
              <th className="px-3 py-2 text-right">Discount</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">
                  {orders.length === 0
                    ? "No orders yet. Complete an order to see it here."
                    : "No orders match your filters."}
                </td>
              </tr>
            ) : (
              visibleOrders.map((o) => {
                const sub = orderSubtotal(o);
                const disc = orderDiscountAmt(o);
                const tot = sub - disc;
                return (
                  <tr key={o.id} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-semibold">{o.id}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <ul className="list-inside space-y-0.5">
                        {o.items.map((i) => (
                          <li key={i.menuItem.id}>
                            {i.quantity}× {i.menuItem.name}{" "}
                            <span className="text-muted-foreground">
                              ({peso(i.menuItem.price)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-3 py-2 capitalize">{o.paymentMethod}</td>
                    <td className="px-3 py-2 text-right">{peso(sub)}</td>
                    <td className="px-3 py-2 text-right text-destructive">
                      {o.discount > 0 ? `- ${peso(disc)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">{peso(tot)}</td>
                    <td className="px-2 py-2 text-right">
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-destructive"
                        onClick={() => removeOne(o.id)}
                        title="Remove order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {visibleOrders.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td colSpan={6} className="px-3 py-3 text-right font-display text-lg font-bold">
                  Grand Total:
                </td>
                <td className="px-3 py-3 text-right font-display text-lg font-bold">
                  {peso(grandTotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
