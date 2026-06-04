import { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  Search,
} from "lucide-react";

import { useCart } from "../hooks/useCart";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const { cart } = useCart();

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

  const handleSearch = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/products");
      return;
    }

    navigate(
      `/products?search=${encodeURIComponent(query)}`
    );

    setIsMobileMenuOpen(false);
  };

  const getLinkClassName = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `uppercase text-sm tracking-wide pb-1 transition ${
      isActive
        ? "border-b-2 border-black font-medium"
        : "text-gray-700 hover:text-black"
    }`;

  const getMobileLinkClassName = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `block py-3 uppercase text-sm tracking-wide transition ${
      isActive
        ? "text-black font-medium"
        : "text-gray-500 hover:text-black"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <NavLink
              to="/"
              className="shrink-0 text-xl font-semibold uppercase tracking-[0.2em]"
            >
              Atelier
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
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

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-6">
              {/* Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="
                      w-64
                      rounded-md
                      border
                      border-gray-200
                      bg-white
                      py-2
                      pl-10
                      pr-4
                      text-sm
                      outline-none
                      transition
                      focus:border-black
                    "
                  />
                </div>
              </form>

              {/* Cart */}
              <NavLink
                to="/cart"
                className="relative text-gray-700 transition hover:text-black"
              >
                <ShoppingBag className="h-5 w-5" />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-black px-1.5 py-0.5 text-[10px] text-white">
                    {cartCount}
                  </span>
                )}
              </NavLink>

              {/* Profile */}
              <NavLink
                to="/profile"
                className="text-gray-700 transition hover:text-black"
              >
                <User className="h-5 w-5" />
              </NavLink>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden"
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
          <div className="border-t border-gray-200 md:hidden">
            <div className="space-y-2 px-4 py-4">
              {/* Mobile Search */}
              <form
                onSubmit={handleSearch}
                className="mb-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="
                      w-full
                      rounded-md
                      border
                      border-gray-200
                      py-2.5
                      pl-10
                      pr-4
                      text-sm
                      outline-none
                      focus:border-black
                    "
                  />
                </div>
              </form>

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
                  Cart
                  {cartCount > 0 &&
                    ` (${cartCount})`}
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