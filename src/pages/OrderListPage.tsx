import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type OrderRow = {
  Order_id: number;
  Order_date: string;
  total_amount: number;
  discount: number;
  payment: string;
};

const OrderListPage = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Group orders by date
  const groupedOrders = orders.reduce((groups, order) => {
    const date = new Date(order.Order_date).toLocaleDateString();

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(order);
    return groups;
  }, {} as Record<string, OrderRow[]>);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("Order")
        .select("*")
        .order("Order_date", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="font-display text-3xl font-bold">Order History</h1>

      <div className="overflow-x-auto rounded border border-border bg-card">
        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left w-[120px]">Order ID</th>
              <th className="px-3 py-2 text-left w-[160px]">Time</th>
              <th className="px-3 py-2 text-left w-[140px]">Payment</th>
              <th className="px-3 py-2 text-right w-[140px]">Discount</th>
              <th className="px-3 py-2 text-right w-[160px]">Total</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center">
                  Loading orders...
                </td>
              </tr>
            )}

            {!loading &&
              Object.entries(groupedOrders).map(([date, dayOrders]) => (
                <>
                  {/* Date separator */}
                  <tr key={date} className="bg-muted">
                    <td colSpan={5} className="px-3 py-2 font-bold">
                      {date}
                    </td>
                  </tr>

                  {dayOrders.map((o) => (
                    <tr key={o.Order_id} className="border-t border-border">

                      <td className="px-3 py-2">
                        {o.Order_id}
                      </td>

                      <td className="px-3 py-2">
                        {new Date(o.Order_date).toLocaleTimeString()}
                      </td>

                      <td className="px-3 py-2 capitalize">
                        {o.payment || "-"}
                      </td>

                      <td className="px-3 py-2 text-right">
                        {o.discount > 0 ? `${o.discount * 100}%` : "-"}
                      </td>

                      <td className="px-3 py-2 text-right font-medium">
                        ₱{o.total_amount.toFixed(2)}
                      </td>

                    </tr>
                  ))}
                </>
              ))}

          </tbody>

        </table>
      </div>
    </div>
  );
};

export default OrderListPage;