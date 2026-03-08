import grndSmash from "@/assets/grnd-smash.jpg";
import grndDoubleSmash from "@/assets/grnd-double-smash.jpg";
import grndSmashDeluxe from "@/assets/grnd-smash-deluxe.jpg";
import grndDoubleDeluxe from "@/assets/grnd-double-deluxe.jpg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "burger" | "combo";
}

export const menuItems: MenuItem[] = [
  {
    id: "grnd-smash-single",
    name: "GRND Smash Classic",
    description: "Toasted bun, melted cheese, single smashed pure beef patty, and GRND signature sauce.",
    price: 175,
    image: grndSmash,
    category: "burger",
  },
  {
    id: "grnd-smash-double",
    name: "Double GRND Smash Classic",
    description: "Toasted bun, double cheese, double smashed pure beef patty, and GRND signature sauce.",
    price: 230,
    image: grndDoubleSmash,
    category: "burger",
  },
  {
    id: "grnd-deluxe-single",
    name: "GRND Smash Deluxe",
    description: "Level up your GRND smash with caramelized onions and crunchy pickles.",
    price: 185,
    image: grndSmashDeluxe,
    category: "burger",
  },
  {
    id: "grnd-deluxe-double",
    name: "Double GRND Smash Deluxe",
    description: "Double smashed patties + double cheese, stacked with caramelized onions and pickles on a toasted bun.",
    price: 250,
    image: grndDoubleDeluxe,
    category: "burger",
  },
  {
    id: "grnd-pair",
    name: "The GRND Pair",
    description: "Two GRND Smash Burgers — Grab one, share one.",
    price: 329,
    image: grndSmash,
    category: "combo",
  },
  {
    id: "grnd-pair-deluxe",
    name: "The GRND Pair Deluxe",
    description: "Two GRND Smash Deluxe Burgers — Grab one, share one.",
    price: 359,
    image: grndSmashDeluxe,
    category: "combo",
  },
];
