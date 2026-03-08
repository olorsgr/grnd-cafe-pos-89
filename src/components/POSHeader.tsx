import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/grnd-logo.png";

const navItems = [
  { label: "ORDER", path: "/" },
  { label: "ORDERLIST", path: "/orders" },
  { label: "ADMIN DASHBOARD", path: "/admin" },
];

const POSHeader = () => {
  const location = useLocation();

  return (
    <header>
      <div className="flex items-center bg-pos-header px-4 py-3">
        <img src={logo} alt="GRND Cafe" className="h-12 w-12 rounded object-contain bg-card" />
        <nav className="ml-auto flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-display text-lg tracking-wide transition-colors ${
                location.pathname === item.path
                  ? "text-accent"
                  : "text-pos-header-foreground hover:text-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="h-1 bg-brand-red" />
    </header>
  );
};

export default POSHeader;
