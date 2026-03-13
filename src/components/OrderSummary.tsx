import type { OrderItem } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface OrderSummaryProps {
  items: OrderItem[];
  discount: number;
  paymentMethod: "cash" | "online";
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onSetPaymentMethod: (method: "cash" | "online") => void;
  onApplyDiscountClick: () => void;
  onClearOrder: () => void;
  onCompleteOrder: () => void;
  onPrintReceipt: () => void;
}

const OrderSummary = ({
  items,
  discount,
  paymentMethod,
  onUpdateQuantity,
  onSetPaymentMethod,
  onApplyDiscountClick,
  onClearOrder,
  onCompleteOrder,
  onPrintReceipt,
}: OrderSummaryProps) => {

  const subtotal = items.reduce(
    (sum, i) => sum + i.menuItem.price * i.quantity,
    0
  );

  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  return (
    <div className="flex h-full flex-col rounded border border-border bg-card p-4">
      <h2 className="mb-4 text-center font-display text-2xl font-bold">
        Order Summary
      </h2>

      {/* Items list */}
      <div className="flex-1 space-y-2 overflow-y-auto border border-border rounded p-3 mb-4 min-h-[120px]">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            No items yet. Tap a menu item to add.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.menuItem.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.menuItem.name}</p>
                <p className="text-muted-foreground">
                  ₱{item.menuItem.price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                  className="rounded p-1 hover:bg-secondary"
                >
                  <Minus className="h-3 w-3" />
                </button>

                <span className="w-6 text-center font-medium">
                  {item.quantity}
                </span>

                <button
                  onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                  className="rounded p-1 hover:bg-secondary"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <p className="w-20 text-right font-medium">
                ₱{(item.menuItem.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="space-y-1 border border-border rounded p-3 mb-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-medium">₱{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Discount ({(discount * 100).toFixed(0)}%):</span>
          <span className="font-medium text-destructive">
            -₱{discountAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between border-t pt-2 font-display text-xl font-bold">
          <span>Total:</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="mb-4">
        <p className="mb-2 text-center text-sm font-medium">
          Payment Method:
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={paymentMethod === "cash" ? "default" : "outline"}
            onClick={() => onSetPaymentMethod("cash")}
          >
            CASH
          </Button>

          <Button
            variant={paymentMethod === "online" ? "default" : "outline"}
            onClick={() => onSetPaymentMethod("online")}
          >
            ONLINE
          </Button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Button
          variant="outline"
          className="font-display text-xs"
          onClick={onApplyDiscountClick}
        >
          APPLY DISCOUNT
        </Button>

        <Button
          variant="outline"
          className="font-display text-xs"
          onClick={onClearOrder}
        >
          CLEAR ORDER
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="bg-brand-orange text-accent-foreground font-display hover:bg-brand-orange/90"
          onClick={onCompleteOrder}
          disabled={items.length === 0}
        >
          COMPLETE ORDER
        </Button>

        <Button
          className="bg-brand-orange text-accent-foreground font-display hover:bg-brand-orange/90"
          onClick={onPrintReceipt}
          disabled={items.length === 0}
        >
          PRINT RECEIPT
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;