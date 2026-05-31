# React Component Report - Ecommerce Frontend

This report documents the React structure of the `ecommerce-frontend` project. It explains every React component/page, the code it depends on, and the functionality it provides.

## Project Overview

- Framework: React 19 with TypeScript
- Build tool: Vite
- Routing: `react-router-dom`
- Icons: `lucide-react`
- Styling: Tailwind CSS utility classes from `src/index.css`
- State management: React Context for cart state
- Product source: Static product data in `src/data/products.ts`

## Application Entry Files

### `src/main.tsx`

Code used:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { CartProvider } from "./context/CartContext";
```

Functionality:

- Starts the React application.
- Finds the HTML element with id `root`.
- Renders the whole app inside React `StrictMode`.
- Wraps `<App />` with `<CartProvider>`, so all components can access cart data using `useCart()`.

### `src/App.tsx`

Code used:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
```

Functionality:

- Defines the main layout of the app.
- Uses `<BrowserRouter>` for client-side routing.
- Shows `<Navbar />` on every page.
- Shows `<Footer />` on every page.
- Defines these routes:

| Route | Component | Purpose |
| --- | --- | --- |
| `/` | `Home` | Homepage |
| `/men` | `Mens` | Men's product listing |
| `/women` | `Womens` | Women's product listing |
| `/kids` | `Kids` | Kids product listing |
| `/products` | `Products` | All products |
| `/product/:id` | `ProductDetails` | Single product details page |
| `/cart` | `Cart` | Shopping cart page |
| `/profile` | `Profile` | Profile placeholder page |

## Shared Data and Context

### `src/data/products.ts`

Code used:

```tsx
export interface Product {
  id: number;
  name: string;
  category: "men" | "women" | "kids";
  price: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  features: string[];
}
```

Functionality:

- Defines the `Product` TypeScript interface.
- Stores all product data in the `products` array.
- Contains 45 products:
  - 15 men's products
  - 15 women's products
  - 15 kids products
- Each product includes name, category, price, image URLs, sizes, description, and feature highlights.

Used by:

- `ProductCard`
- `Products`
- `Mens`
- `Womens`
- `Kids`
- `ProductDetails`
- `FeaturedSection`

### `src/context/CartContext.tsx`

Code used:

```tsx
import { createContext, useContext, useState } from "react";
import type { Product } from "../data/products";
```

Main interfaces:

```tsx
export interface CartItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
}
```

Functionality:

- Creates a global cart context.
- Stores cart items in React state.
- Exposes `useCart()` hook for all components.
- Supports cart items with optional size and color.
- Provides these functions:

| Function | Purpose |
| --- | --- |
| `addToCart(product, options)` | Adds a product to the cart. If same product, size, and color already exist, quantity increases. |
| `removeFromCart(id, size, color)` | Removes one matching cart item. |
| `increaseQty(id, size, color)` | Increases quantity of a matching cart item. |
| `decreaseQty(id, size, color)` | Decreases quantity. If quantity becomes 0, item is removed. |
| `useCart()` | Custom hook used by components to access cart state and cart actions. |

Used by:

- `main.tsx`
- `Navbar`
- `ProductCard`
- `ProductDetails`
- `Cart`
- `CartDrawer`

## Layout Components

### `src/components/Navbar.tsx`

Code used:

```tsx
import { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, User, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
```

State/hooks:

- `useState(false)` controls mobile menu open/close state.
- `useCallback()` memoizes mobile menu handlers.
- `useCart()` reads cart items.

Functionality:

- Displays the site logo `Atelier`.
- Shows desktop navigation links: Home, Men, Women, Kids.
- Shows cart icon with total quantity badge.
- Shows profile icon.
- Provides a responsive mobile menu.
- Uses `NavLink` active state to style the current page link.

Important logic:

```tsx
const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
```

This calculates total quantity in the cart, not only unique products.

### `src/components/Footer.tsx`

Code used:

```tsx
import { NavLink } from "react-router-dom";
```

Functionality:

- Displays brand information.
- Provides footer navigation sections:
  - Shop
  - Company
  - Support
- Shows the current year dynamically with `new Date().getFullYear()`.
- Includes social labels: Instagram, Twitter, Facebook.

### `src/components/Hero.tsx`

Code used:

```tsx
import { NavLink } from "react-router-dom";
import heroHome from "../assets/hero-men.jpg";
```

Functionality:

- Renders the large homepage hero section.
- Uses `hero-men.jpg` as a background image.
- Shows title, subtitle, and two CTA buttons.
- Primary button links to `/products`.
- Secondary button links to `/men`.

Internal data used:

```tsx
const HERO_DATA = {
  image: heroHome,
  title: "Timeless Fashion",
  primary: { label: "Shop Now", link: "/products" },
  secondary: { label: "Explore Men", link: "/men" },
};
```

## Product Components

### `src/components/ProductCard.tsx`

Code used:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";
```

Props:

```tsx
interface Props {
  product: Product;
}
```

State/hooks:

- `useState(false)` stores temporary added-to-cart button state.
- `useCart()` provides `addToCart`.

Functionality:

- Displays product image, name, and price.
- Wraps the card in a link to `/product/{id}`.
- Adds the product to cart from the card.
- Prevents the button click from opening the product detail page.
- Shows a ripple animation on add-to-cart click.
- Temporarily changes button display after adding.

Important logic:

```tsx
addToCart(product);
setAdded(true);
```

This adds the product with default quantity `1` and no selected size/color.

### `src/components/SkeletonCard.tsx`

Code used:

- No imports.
- Uses Tailwind CSS classes and the `.skeleton` class from `src/index.css`.

Functionality:

- Displays a loading placeholder shaped like a product card.
- Used while product listing pages simulate loading.

Used by:

- `Mens`
- `Womens`
- `Kids`
- `Products`

### `src/components/CartDrawer.tsx`

Code used:

```tsx
import { X } from "lucide-react";
import { useCart } from "../context/CartContext";
```

Props:

```tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
}
```

Functionality:

- Creates a slide-in cart drawer from the right side.
- Shows an overlay when open.
- Displays cart items with image, name, price, and quantity.
- Removes items from cart.
- Calculates subtotal.
- Shows checkout button when cart has items.

Important note:

- This component exists but is not currently imported or rendered by `App.tsx` or `Navbar.tsx`.
- The project currently uses the full `/cart` page instead of this drawer.

### `src/components/CollectionGrid.tsx`

Code used:

```tsx
import { NavLink } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import collsample from "../assets/collsample.jpg";
```

Functionality:

- Displays a "Shop by Collection" grid on the homepage.
- Uses a local image for the first collection.
- Uses `/images/...` paths for other collection images.
- Every collection currently links to `/men`.
- Shows hover scale and arrow icon effects.

Internal data:

```tsx
const collections = [
  { name: "T-Shirts", image: collsample, link: "/men" },
  { name: "Sweatshirts", image: "/images/sweatshirts.jpg", link: "/men" },
  ...
];
```

## Home Page Sections

### `src/components/home/CategorySection.tsx`

Code used:

```tsx
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
```

Functionality:

- Displays category cards for Men, Women, and Kids.
- Each card has an image, description, and link.
- Uses hover image zoom and arrow icon.
- Links:
  - Men -> `/men`
  - Women -> `/women`
  - Kids -> `/kids`

### `src/components/home/FeaturedSection.tsx`

Code used:

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "../../data/products";
import ProductCard from "../ProductCard";
```

State/hooks:

- `current` stores current carousel slide.
- `cardsPerView` stores responsive number of products visible per slide.
- `useEffect()` listens to window resize and updates `cardsPerView`.

Functionality:

- Displays the first 8 products as a carousel.
- Uses `ProductCard` for each product.
- Shows previous/next buttons.
- Shows slide dots.
- Includes `View All` link to `/products`.
- Adjusts product count per slide based on screen width:
  - Mobile: 1
  - Small tablet: 2
  - Tablet: 3
  - Desktop: 4

### `src/components/home/PromoSection.tsx`

Code used:

```tsx
import { Link } from "react-router-dom";
```

Functionality:

- Renders a black promotional section.
- Shows "New Season Arrivals" text.
- Links to `/products`.

Important note:

- This component exists but is not currently used in `Home.tsx`.
- `Home.tsx` currently contains a duplicated promo section directly in the page.

### `src/components/home/TestimonialsSection.tsx`

Code used:

```tsx
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
```

State/hooks:

- `current` stores active testimonial slide.
- `cardsPerView` stores responsive card count.
- `isHovered` pauses auto-slide while mouse is over the carousel.
- `useMemo()` calculates total slides.
- `useEffect()` handles screen resize.
- `useEffect()` handles auto-slide timer.

Functionality:

- Displays customer testimonials.
- Shows responsive testimonial carousel.
- Auto-advances every 5 seconds.
- Pauses auto-slide on hover.
- Provides previous/next controls and dot navigation.

### `src/components/home/TrustSection.tsx`

Code used:

```tsx
import { Truck, ShieldCheck, Star, RefreshCcw } from "lucide-react";
```

Functionality:

- Displays four trust/benefit blocks:
  - Fast Delivery
  - Secure Payments
  - Easy Returns
  - Premium Quality
- Maps icon components from the `features` array.

Important logic:

```tsx
const Icon = item.icon;
```

This allows each item to render a different Lucide icon dynamically.

## Page Components

### `src/pages/Home.tsx`

Code used:

```tsx
import Hero from "../components/Hero";
import { Link } from "react-router-dom";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CategorySection from "../components/home/CategorySection";
import FeaturedSecion from "../components/home/FeaturedSection";
import CollectionGrid from "../components/CollectionGrid";
import TrustSection from "../components/home/TrustSection";
```

Functionality:

- Builds the homepage.
- Renders these sections in order:
  1. `Hero`
  2. `CollectionGrid`
  3. `TrustSection`
  4. `FeaturedSection`
  5. `CategorySection`
  6. `TestimonialsSection`
  7. Inline promo section

Important notes:

- `products`, `ProductCard`, and `TrustSecion` are imported but not used.
- `FeaturedSecion` and `TrustSecion` are misspelled import variable names, but `FeaturedSecion` still works because it points to the correct file.
- `PromoSection` exists as a separate component but the homepage uses an inline duplicate section instead.

### `src/pages/Products.tsx`

Code used:

```tsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { products } from "../data/products";
```

State/hooks:

- `loading` starts as `true`.
- `useEffect()` uses a 1-second timer before showing products.

Functionality:

- Displays all products.
- Shows 10 skeleton cards during loading.
- After loading, maps all products to `ProductCard`.

### `src/pages/Mens.tsx`

Code used:

```tsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { products } from "../data/products";
```

Functionality:

- Filters products where `category === "men"`.
- Shows skeleton loading for 1 second.
- Displays men's products using `ProductCard`.

Important logic:

```tsx
const mensProducts = products.filter((product) => product.category === "men");
```

### `src/pages/Womens.tsx`

Code used:

```tsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { products } from "../data/products";
```

Functionality:

- Filters products where `category === "women"`.
- Shows skeleton loading for 1 second.
- Displays women's products using `ProductCard`.

Important logic:

```tsx
const womensProducts = products.filter((product) => product.category === "women");
```

### `src/pages/Kids.tsx`

Code used:

```tsx
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { products } from "../data/products";
```

Functionality:

- Filters products where `category === "kids"`.
- Shows skeleton loading for 1 second.
- Displays kids products using `ProductCard`.

Important logic:

```tsx
const kidsProducts = products.filter((product) => product.category === "kids");
```

### `src/pages/ProductDetails.tsx`

Code used:

```tsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
```

Route used:

```tsx
/product/:id
```

State/hooks:

- `useParams()` reads the product id from the URL.
- `useMemo()` finds the selected product.
- `useMemo()` builds the image gallery.
- `selectedImage` controls current gallery image.
- `selectedSize` controls selected product size.
- `selectedColor` controls selected color.
- `quantity` controls cart quantity.
- `isZoomed` controls image zoom.
- `zoomPosition` controls zoom focus point.
- `touchStartX` and `touchEndX` support mobile swipe.

Functionality:

- Shows product breadcrumb navigation.
- Finds product by URL id.
- Shows product-not-found message if no matching product exists.
- Displays image gallery.
- Supports next/previous image buttons.
- Supports touch swipe between gallery images on mobile.
- Supports hover zoom on main product image.
- Lets user choose size and color.
- Lets user increase/decrease quantity.
- Adds product to cart with selected size, color, and quantity.
- Shows product highlights.
- Shows delivery and returns information.
- Shows related products from the same category.

Important logic:

```tsx
const product = useMemo(
  () => products.find((item) => item.id === Number(id)),
  [id]
);
```

```tsx
addToCart(product, {
  size: selectedSize,
  color: selectedColor,
  quantity,
});
```

### `src/pages/Cart.tsx`

Code used:

```tsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
```

State/hooks:

- Uses `useCart()` to access:
  - `cart`
  - `increaseQty`
  - `decreaseQty`
  - `removeFromCart`

Functionality:

- Shows an empty-cart page when cart is empty.
- Shows cart item list when cart has products.
- Each item links back to its product details page.
- Displays product image, name, price, size, color, and quantity.
- Allows quantity increase and decrease.
- Allows removing an item.
- Calculates subtotal.
- Displays order summary with free shipping.
- Shows checkout button.

Important logic:

```tsx
const subtotal = cart.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0
);
```

### `src/pages/Profile.tsx`

Code used:

- No imports.

Functionality:

- Simple placeholder page.
- Displays `Profile Page`.

## Styling and Animation Helpers

### `src/index.css`

Code used:

```css
@import "tailwindcss";
```

Functionality:

- Loads Tailwind CSS.
- Defines `.cart-in` animation used by `ProductDetails`.
- Defines `.ripple` animation used by `ProductCard` and `ProductDetails`.
- Defines `.skeleton` loading shimmer used by `SkeletonCard`.

Important classes:

| Class | Used by | Purpose |
| --- | --- | --- |
| `.cart-in` | `ProductDetails` | Small add-to-cart icon animation |
| `.ripple` | `ProductCard`, `ProductDetails` | Click ripple effect on add-to-cart button |
| `.skeleton` | `SkeletonCard` | Loading placeholder shimmer |

### `src/App.css`

Functionality:

- Contains default Vite starter styles for logo/card layout.
- This file does not appear to be imported by the current app entry.

## Component Relationship Summary

```text
main.tsx
  CartProvider
    App
      BrowserRouter
        Navbar
        Routes
          Home
            Hero
            CollectionGrid
            TrustSection
            FeaturedSection
              ProductCard
            CategorySection
            TestimonialsSection
            Inline Promo Section
          Mens
            SkeletonCard
            ProductCard
          Womens
            SkeletonCard
            ProductCard
          Kids
            SkeletonCard
            ProductCard
          Products
            SkeletonCard
            ProductCard
          ProductDetails
            ProductCard
          Cart
          Profile
        Footer
```

## Current Cleanup Opportunities

- `Home.tsx` imports `products`, `ProductCard`, and `TrustSecion` but does not use them.
- `Home.tsx` has spelling mistakes in local import variable names: `FeaturedSecion`, `TrustSecion`.
- `PromoSection.tsx` exists but is not used; the same promo section is written inline in `Home.tsx`.
- `CartDrawer.tsx` exists but is not currently used.
- `Footer.tsx`, `ProductCard.tsx`, `Cart.tsx`, `ProductDetails.tsx`, and some product text contain encoding artifacts such as `â‚¹`, `Â©`, and `â€¢`. These should display as proper symbols if the file encoding/text is fixed.
- `CollectionGrid.tsx` uses several `/images/...` paths, but those image files are not present in the current `public` folder listing.
