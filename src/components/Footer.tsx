import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h2 className="text-xl font-semibold uppercase tracking-widest">
              Atelier
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Premium fashion for men, women, and kids.  
              Designed with elegance. Built for comfort.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide mb-4">
              Shop
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <NavLink to="/men" className="hover:text-black transition">
                  Men
                </NavLink>
              </li>
              <li>
                <NavLink to="/women" className="hover:text-black transition">
                  Women
                </NavLink>
              </li>
              <li>
                <NavLink to="/kids" className="hover:text-black transition">
                  Kids
                </NavLink>
              </li>
              <li>
                <NavLink to="/products" className="hover:text-black transition">
                  All Products
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide mb-4">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <NavLink to="/" className="hover:text-black transition">
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/" className="hover:text-black transition">
                  Careers
                </NavLink>
              </li>
              <li>
                <NavLink to="/" className="hover:text-black transition">
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/" className="hover:text-black transition">
                  Terms & Conditions
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <NavLink to="/" className="hover:text-black transition">
                  Help Center
                </NavLink>
              </li>
              <li>
                <NavLink to="/" className="hover:text-black transition">
                  Shipping & Returns
                </NavLink>
              </li>
              <li>
                <NavLink to="/" className="hover:text-black transition">
                  Contact Us
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Atelier. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-gray-500">
            <span>Instagram</span>
            <span>Twitter</span>
            <span>Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
