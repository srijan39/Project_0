import { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, User, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

interface NavItem {
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Men", to: "/men" },
  { label: "Women", to: "/women" },
  { label: "Kids", to: "/kids" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { cart } = useCart();

  // Total quantity (not unique items)
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `uppercase text-gray-700 pb-1 transition ${
      isActive
        ? "border-b-2 border-black font-medium"
        : "hover:text-black"
    }`;

  const getMobileLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `block py-3 uppercase transition ${
      isActive
        ? "text-black font-medium"
        : "text-gray-500 hover:text-black"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <NavLink
              to="/"
              className="text-xl font-semibold uppercase tracking-wider"
            >
              Atelier
            </NavLink>

            {/* Desktop Links */}
            <div className="hidden md:flex gap-10">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={getLinkClassName}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-8">
              
              {/* Cart */}
              <NavLink
                to="/cart"
                className="relative text-gray-700 hover:text-black transition"
              >
                <ShoppingBag className="h-5 w-5" />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </NavLink>

              {/* Profile */}
              <NavLink
                to="/profile"
                className="text-gray-700 hover:text-black transition"
              >
                <User className="h-5 w-5" />
              </NavLink>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={getMobileLinkClassName}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavLink>
              ))}

              <NavLink
                to="/profile"
                className={getMobileLinkClassName}
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </div>
              </NavLink>

              <NavLink
                to="/cart"
                className={getMobileLinkClassName}
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Cart {cartCount > 0 && `(${cartCount})`}
                </div>
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;