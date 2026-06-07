Atelier

Timeless fashion, crafted for everyday elegance

A modern clothing e-commerce website focused on providing a clean, smooth, and user-friendly shopping experience.

Overview

-- This project is built to make online shopping simple and easy to use
-- Users can browse products, explore categories, and interact with features like wishlist and cart
-- The focus is on clean UI, smooth navigation, and responsive design

Features

-- Browse products by category (Men, Women, Kids)
-- Product listing and product details page
-- Wishlist functionality
-- Add to cart with drawer UI
-- Responsive layout for all devices
-- Skeleton loading components for better UX

Tech Stack
Frontend

-- React
-- TypeScript
-- Tailwind CSS
-- React Router

Backend

-- Node.js
-- Express

Database

-- MongoDB

Project Structure
Project_0/
│
├── ecommerce-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── data/
│   │   └── services/
│
├── ecommerce-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│
├── ecommerce-admin/   # Not implemented yet

Current Status
-- Frontend is actively developed and functional
-- Backend APIs are partially implemented
-- Admin panel is planned but not developed yet

Future Improvements

-- Admin dashboard for managing products
-- User authentication (Login/Signup)
-- Order management system
-- Payment gateway integration
-- Product reviews and ratings

What I Learned

-- Building a full-stack application using React and Node.js
-- Structuring scalable frontend and backend architecture
-- Working with MongoDB and REST APIs
-- Improving UI/UX with Tailwind CSS

Contributing

-- Contributions are welcome
-- Issues will be labeled (beginner-friendly, frontend, backend, bug)
-- Pull requests will be reviewed within a few days
-- Guidance will be provided to help contributors get started

Author

Srijan

## Scroll Position Fix

### Frontend

* Files Added
  * `ecommerce-frontend/src/components/ScrollToTop.tsx`
* Files Modified
  * `ecommerce-frontend/src/App.tsx`
* Implementation Details
  * Added a global `ScrollToTop` component that reads `pathname` from `useLocation()`.
  * Mounted `ScrollToTop` once inside `BrowserRouter`, before the shared layout and route definitions.
  * The component returns `null` and only runs a `window.scrollTo({ top: 0, left: 0, behavior: "auto" })` effect when `pathname` changes.
  * No duplicate manual scroll reset logic was found in the frontend source.
* Performance Impact
  * Negligible. The component has no rendered UI, tracks only `pathname`, and performs a single browser scroll operation per route path change.
* Test Results
  * `npm run build` passed for `ecommerce-frontend`.
  * Targeted lint passed for `src/App.tsx` and `src/components/ScrollToTop.tsx`.
  * Full frontend lint still reports pre-existing `react-hooks/set-state-in-effect` errors in product/image-loading files unrelated to this scroll fix.

### Admin

* Files Added
  * `ecommerce-admin/src/components/ScrollToTop.tsx`
* Files Modified
  * `ecommerce-admin/src/App.tsx`
  * `ecommerce-admin/src/layouts/AdminLayout.tsx`
* Implementation Details
  * Added a global `ScrollToTop` component that reads `pathname` from `useLocation()`.
  * Mounted `ScrollToTop` once inside the admin `BrowserRouter`, before admin routes.
  * The component resets the browser window and the admin layout's scrollable main container on pathname changes.
  * Added a non-visual `data-route-scroll-container` marker to the admin `<main>` element so nested protected routes reset the actual scroll container.
  * No duplicate manual scroll reset logic was found in the admin source.
* Performance Impact
  * Negligible. The component has no rendered UI, tracks only `pathname`, and performs one window scroll plus one optional container scroll per route path change.
* Test Results
  * `npm run lint` passed for `ecommerce-admin`.
  * `npm run build` passed for `ecommerce-admin`.
  * Targeted lint passed for `src/App.tsx`, `src/components/ScrollToTop.tsx`, and `src/layouts/AdminLayout.tsx`.

### Validation

* Route changes now start from the top of the page in the frontend because `ScrollToTop` resets the window scroll position whenever `pathname` changes.
* Route changes now start from the top of the admin content area because `ScrollToTop` resets both the window and the scrollable admin `<main>` container whenever `pathname` changes.
* No UI changes occurred; the new components render `null`, and the admin layout change only adds a data attribute.
* No API, authentication, security, performance, cart functionality, state management, lazy loading, animation, or business logic changes occurred.
