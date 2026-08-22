import { useState, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  ShoppingBag,
  Search,
  Heart,
} from "lucide-react";

import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { useAuth } from "../hooks/useAuth";

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

const isNavItemActive = (pathname: string, itemPath: string) =>
  itemPath === "/" ? pathname === "/" : pathname === itemPath;

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const profilePath = isAuthenticated ? "/profile" : "/login";

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = search.trim();

    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex h-16 min-w-0 items-center justify-between">
            {/* Logo */}
            <NavLink
              to="/"
              className="shrink-0 text-lg font-semibold uppercase tracking-[0.14em] sm:text-xl sm:tracking-[0.2em]"
            >
              Atelier
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 lg:flex h-16">
              {navItems.map((item) => {
                const isActive = isNavItemActive(location.pathname, item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`relative flex items-center h-full px-1 uppercase text-base font-semibold tracking-wider transition-colors duration-200 ${
                      isActive ? "text-black" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    {item.label}
                    {/* Active Route Underline Only */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 h-[2px] w-full bg-black" />
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-48 lg:w-64 rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-black"
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

              {/* Wishlist */}
              <NavLink
                to="/wishlist"
                className="relative text-gray-700 transition hover:text-black"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 rounded-full bg-black px-1.5 py-0.5 text-[10px] text-white">
                    {wishlistCount}
                  </span>
                )}
              </NavLink>

              {/* Profile */}
              <NavLink
                to={profilePath}
                className="text-gray-700 transition hover:text-black"
              >
                <User className="h-5 w-5" />
              </NavLink>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="shrink-0 lg:hidden"
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
          <div className="border-t border-gray-200 lg:hidden">
            <div className="space-y-2 px-4 py-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black"
                  />
                </div>
              </form>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = isNavItemActive(location.pathname, item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileMenu}
                      className={`relative block py-3 uppercase text-base font-semibold tracking-wider transition-all duration-200 ${
                        isActive
                          ? "text-black pl-3 border-l-2 border-black"
                          : "text-gray-500 hover:text-black pl-3 border-l-2 border-transparent"
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-1">
                <NavLink
                  to={profilePath}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block py-3 uppercase text-sm font-medium tracking-wider transition-colors ${
                      isActive ? "text-black" : "text-gray-500 hover:text-black"
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {isAuthenticated ? "Profile" : "Login"}
                  </div>
                </NavLink>

                <NavLink
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block py-3 uppercase text-sm font-medium tracking-wider transition-colors ${
                      isActive ? "text-black" : "text-gray-500 hover:text-black"
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                  </div>
                </NavLink>

                <NavLink
                  to="/cart"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block py-3 uppercase text-sm font-medium tracking-wider transition-colors ${
                      isActive ? "text-black" : "text-gray-500 hover:text-black"
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </div>
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;