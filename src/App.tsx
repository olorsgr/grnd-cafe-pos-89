import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import POSHeader from "./components/POSHeader";
import Index from "./pages/OrderPage";
import OrderListPage from "./pages/OrderListPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/grnd-cafe-pos-89">
        <div className="flex h-screen flex-col">
          <POSHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Index />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
