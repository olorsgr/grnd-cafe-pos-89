import type { MenuItem } from "@/data/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => {
  return (
    <button
      onClick={() => onAdd(item)}
      className="group flex flex-col overflow-hidden rounded border border-border bg-card text-left transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-display text-sm font-semibold leading-tight">{item.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        <p className="mt-auto pt-1 font-display text-base font-bold text-accent">
          ₱{item.price.toFixed(2)}
        </p>
      </div>
    </button>
  );
};

export default MenuItemCard;
