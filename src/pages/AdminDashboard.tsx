import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  Order_id: number;
  Order_date: string;
  total_amount: number;
  payment: string;
};

type OrderDetail = {
  OrderID: number;
  ProductID: string;
  Quantity: number;
  Alias: string;
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [detailsData, setDetailsData] = useState<OrderDetail[]>([]);
  const [bestSeller, setBestSeller] = useState<string>("N/A");
  const [bestSellerCount, setBestSellerCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from<Order>("Order" as const)
          .select("*");
        if (orderError) throw orderError;
        if (!orderData) return;
        setOrders(orderData);

        const { data: orderDetails, error: detailsError } = await supabase
          .from<OrderDetail>("OrderDetails" as const)
          .select("*");
        if (detailsError) throw detailsError;
        if (!orderDetails) return;
        setDetailsData(orderDetails);

        // Calculate best seller by Alias
        const counts: Record<string, number> = {};
        orderDetails.forEach(({ Alias, Quantity }) => {
          if (!Alias || !Quantity) return;
          counts[Alias] = (counts[Alias] || 0) + Quantity;
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          setBestSeller(sorted[0][0]);
          setBestSellerCount(sorted[0][1]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const todayStr = new Date().toLocaleDateString();
  const ordersToday = orders.filter(
    (o) => new Date(o.Order_date).toLocaleDateString() === todayStr
  );
  const totalSalesToday = ordersToday.reduce((sum, o) => sum + o.total_amount, 0);

  const cashOrders = orders.filter((o) => o.payment === "cash");
  const onlineOrders = orders.filter((o) => o.payment === "online");
  const cashPercent = orders.length ? Math.round((cashOrders.length / orders.length) * 100) : 0;
  const onlinePercent = orders.length ? Math.round((onlineOrders.length / orders.length) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border rounded bg-card">
          <p className="text-sm text-muted-foreground">Total Sales</p>
          <p className="text-2xl font-bold">₱{totalSalesToday.toFixed(2)}</p>
        </div>

        <div className="p-4 border rounded bg-card">
          <p className="text-sm text-muted-foreground">Orders Today</p>
          <p className="text-2xl font-bold">{ordersToday.length}</p>
        </div>

        <div className="p-4 border rounded bg-card">
          <p className="text-sm text-muted-foreground">Best Seller</p>
          <p className="text-lg font-bold">{bestSeller}</p>
          <p className="text-sm text-muted-foreground">{bestSellerCount} sold</p>
        </div>

        <div className="p-4 border rounded bg-card">
          <p className="text-sm text-muted-foreground">Cash vs Online</p>
          <p className="text-lg font-bold">{cashPercent}% / {onlinePercent}%</p>
          <p className="text-xs text-muted-foreground">Cash / Online</p>
        </div>
      </div>

      <div className="p-6 border rounded bg-card">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Order ID</th>
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Payment</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(-5).reverse().map((o) => (
              <tr key={o.Order_id} className="border-t">
                <td className="py-2">{o.Order_id}</td>
                <td className="py-2">{new Date(o.Order_date).toLocaleString()}</td>
                <td className="py-2 capitalize">{o.payment}</td>
                <td className="py-2 text-right">₱{o.total_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;