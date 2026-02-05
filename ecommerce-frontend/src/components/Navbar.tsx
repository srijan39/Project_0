import { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, User } from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Men", to: "/men" },
  { label: "Women", to: "/women" },
  { label: "Kids", to: "/kids" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `nav-link uppercase text-nav pb-1 ${isActive ? "nav-link-active" : ""}`;

  const getMobileLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `block py-3 text-nav-mobile uppercase transition-colors duration-200 ${
      isActive 
        ? "text-foreground font-medium" 
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className="bg-background/95 backdrop-blur-sm border-b border-border"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-nav items-center justify-between">
            {/* Logo */}
            <NavLink
              to="/"
              className="text-xl font-medium tracking-wider uppercase text-foreground transition-opacity hover:opacity-70"
              aria-label="Go to homepage"
            >
              Atelier
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-12">
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

            {/* Desktop Profile & Actions */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink
                to="/profile"
                className={getLinkClassName}
                aria-label="View profile"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" strokeWidth={1.5} />
                  <span className="sr-only md:not-sr-only">Profile</span>
                </span>
              </NavLink>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden p-2 -mr-2 text-foreground transition-opacity hover:opacity-70"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-border mobile-menu-enter"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={getMobileLinkClassName}
                    onClick={closeMobileMenu}
                    role="menuitem"
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="pt-3 mt-3 border-t border-border">
                  <NavLink
                    to="/profile"
                    className={getMobileLinkClassName}
                    onClick={closeMobileMenu}
                    role="menuitem"
                  >
                    <span className="flex items-center gap-3">
                      <User className="h-4 w-4" strokeWidth={1.5} />
                      Profile
                    </span>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
