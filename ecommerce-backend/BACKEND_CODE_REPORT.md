# Backend Code Report - Ecommerce Backend

This report documents the current `ecommerce-backend` project in detail. This project is a Node.js/Express/MongoDB backend, so it does not contain React components. Instead, this report explains every backend module, the code it uses, and the functionality it provides.

## Project Overview

- Runtime: Node.js
- Language: TypeScript
- Server framework: Express
- Database: MongoDB through Mongoose
- Environment variables: dotenv
- Validation: express-validator
- API style: REST-style product endpoints
- Main resource currently implemented: Product

## Package Configuration

### `package.json`

Scripts:

| Script | Command | Functionality |
| --- | --- | --- |
| `dev` | `ts-node-dev --respawn --transpile-only src/server.ts` | Runs the backend in development mode and restarts when files change. |
| `build` | `tsc` | Compiles TypeScript source files into JavaScript. |
| `start` | `node dist/server.js` | Starts the compiled production server. |

Dependencies:

| Dependency | Used for |
| --- | --- |
| `express` | Creating the HTTP server, routes, middleware, and JSON API responses. |
| `mongoose` | Connecting to MongoDB and defining the Product model/schema. |
| `cors` | Allowing requests from frontend/admin apps running on different origins. |
| `dotenv` | Loading environment variables such as `PORT` and `MONGO_URI`. |
| `express-validator` | Validating incoming product request body fields. |
| `bcryptjs` | Installed for password hashing, but not currently used in the code. |
| `jsonwebtoken` | Installed for JWT authentication, but not currently used in the code. |

Dev dependencies:

| Dependency | Used for |
| --- | --- |
| `typescript` | TypeScript compiler. |
| `ts-node-dev` | Runs TypeScript directly in development with auto-restart. |
| `@types/*` packages | Type definitions for TypeScript support. |

## TypeScript Configuration

### `tsconfig.json`

Important code:

```json
{
  "target": "ES2020",
  "module": "commonjs",
  "rootDir": "./src",
  "outDir": "./dist",
  "esModuleInterop": true,
  "strict": true,
  "skipLibCheck": true,
  "moduleResolution": "node",
  "resolveJsonModule": true
}
```

Functionality:

- Reads TypeScript files from `src`.
- Outputs compiled files into `dist`.
- Uses CommonJS modules.
- Enables strict TypeScript checking.
- Allows easier imports from CommonJS packages using `esModuleInterop`.
- Excludes `node_modules`.

## Backend Entry Flow

```text
src/server.ts
  loads dotenv
  imports app
  imports connectDB
  connects MongoDB
  starts Express server

src/app.ts
  creates Express app
  registers CORS and JSON middleware
  registers health route
  mounts product routes
  registers notFound middleware
  registers errorHandler middleware
```

## Source Files

### `src/server.ts`

Code used:

```ts
import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
```

Main logic:

```ts
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
```

Functionality:

- Loads environment variables from `.env`.
- Reads `PORT` from environment variables.
- Falls back to port `5000` when `PORT` is missing.
- Calls `connectDB()` before starting the server.
- Starts the Express app with `app.listen`.
- Logs the running port.
- Catches startup errors and exits the process with status code `1`.

Required environment variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Optional server port. Defaults to `5000`. |
| `MONGO_URI` | Required by `connectDB()` to connect to MongoDB. |

### `src/app.ts`

Code used:

```ts
import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";
import notFound from "./middleware/notFound.middleware";
import errorHandler from "./middleware/error.middleware";
```

Main logic:

```ts
const app = express();

app.use(cors());
app.use(express.json());
```

Functionality:

- Creates the Express application.
- Enables CORS for cross-origin requests.
- Enables JSON body parsing with `express.json()`.
- Defines a root health/status endpoint.
- Mounts product routes at `/api/products`.
- Registers the 404 not-found middleware after routes.
- Registers the global error handler last.

Root endpoint:

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/` | `{ success: true, message: "Ecommerce API Running" }` |

Mounted route:

```ts
app.use("/api/products", productRoutes);
```

This means every route in `product.routes.ts` starts with `/api/products`.

Middleware order:

```text
cors()
express.json()
GET /
/api/products routes
notFound
errorHandler
```

### `src/config/db.ts`

Code used:

```ts
import mongoose from "mongoose";
```

Main logic:

```ts
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
```

Functionality:

- Connects the backend to MongoDB using Mongoose.
- Reads the MongoDB connection string from `process.env.MONGO_URI`.
- Logs the connected MongoDB host when successful.
- Logs connection errors.
- Stops the Node process if the database connection fails.

Important note:

- `process.env.MONGO_URI as string` tells TypeScript to treat the value as a string, but it does not check at runtime whether `MONGO_URI` exists. If `MONGO_URI` is missing, Mongoose connection will fail.

### `src/models/product.model.ts`

Code used:

```ts
import mongoose, { Schema, Document } from "mongoose";
```

Interface:

```ts
export interface IProduct extends Document {
  name: string;
  category: "men" | "women" | "kids";
  price: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

Functionality:

- Defines the TypeScript shape for a Product document.
- Extends Mongoose `Document`, so product objects include MongoDB/Mongoose document behavior.
- Includes timestamp fields created by Mongoose.

Schema fields:

| Field | Type | Required | Validation/default | Purpose |
| --- | --- | --- | --- | --- |
| `name` | `String` | Yes | `trim: true` | Product name. |
| `category` | `String` | Yes | enum: `men`, `women`, `kids` | Product category. |
| `price` | `Number` | Yes | `min: 0` | Product price. |
| `image` | `String` | Yes | none | Main product image URL. |
| `images` | `[String]` | No | default: `[]` | Gallery image URLs. |
| `description` | `String` | Yes | none | Product description. |
| `sizes` | `[String]` | No | default: `[]` | Available sizes. |
| `features` | `[String]` | No | default: `[]` | Product highlights/features. |

Timestamp option:

```ts
{
  timestamps: true,
}
```

This automatically adds and maintains:

- `createdAt`
- `updatedAt`

Export:

```ts
export default mongoose.model<IProduct>("Product", productSchema);
```

This creates the Mongoose model named `Product`.

### `src/controllers/product.controller.ts`

Code used:

```ts
import { Request, Response } from "express";
import Product from "../models/product.model";
import asyncHandler from "../utils/asyncHandler";
```

Functionality:

- Contains product request handlers.
- Uses the `Product` Mongoose model for database operations.
- Wraps async functions with `asyncHandler` so errors move to Express error middleware.

#### `getProducts`

Code:

```ts
export const getProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  }
);
```

Functionality:

- Handles product list requests.
- Fetches all products from MongoDB using `Product.find()`.
- Returns HTTP status `200`.
- Sends:
  - `success: true`
  - `count`: number of products found
  - `data`: product array

API usage:

| Method | Route | Controller |
| --- | --- | --- |
| `GET` | `/api/products` | `getProducts` |

#### `createProduct`

Code:

```ts
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  }
);
```

Functionality:

- Handles product creation.
- Reads product data from `req.body`.
- Creates a MongoDB document using `Product.create(req.body)`.
- Returns HTTP status `201`.
- Sends the created product in `data`.

API usage:

| Method | Route | Controller |
| --- | --- | --- |
| `POST` | `/api/products` | `createProduct` |

Important note:

- `createProduct` trusts `req.body`.
- Validation should run before this controller, but the current route file has a duplicate `POST /` registration that bypasses validation first.

#### `getProductById`

Code:

```ts
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);
```

Functionality:

- Handles single-product lookup.
- Reads product id from `req.params.id`.
- Uses `Product.findById(...)`.
- If product is missing, returns HTTP status `404`.
- If product exists, returns HTTP status `200` with product data.

API usage:

| Method | Route | Controller |
| --- | --- | --- |
| `GET` | `/api/products/:id` | `getProductById` |

Important behavior:

- If `req.params.id` is a valid MongoDB ObjectId but no product exists, the user gets a clean `404`.
- If `req.params.id` is not a valid ObjectId, Mongoose may throw a cast error, which is caught by `asyncHandler` and sent to `errorHandler`.

### `src/routes/product.routes.ts`

Code used:

```ts
import { Router } from "express";
import {
  getProducts,
  createProduct,
  getProductById,
} from "../controllers/product.controller";
import { validateProduct } from "../middleware/productValidation";
```

Main logic:

```ts
const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.post("/", validateProduct, createProduct);

export default router;
```

Functionality:

- Creates an Express router for product endpoints.
- Connects HTTP routes to product controller functions.
- Exports the router for `app.ts`.

Current routes:

| Method | Full path | Middleware/controller chain | Functionality |
| --- | --- | --- | --- |
| `GET` | `/api/products` | `getProducts` | Returns all products. |
| `GET` | `/api/products/:id` | `getProductById` | Returns one product by MongoDB id. |
| `POST` | `/api/products` | `createProduct` | Creates a product without validation. |
| `POST` | `/api/products` | `validateProduct`, `createProduct` | Intended validated product creation. |

Important issue:

- `router.post("/", createProduct)` is registered before `router.post("/", validateProduct, createProduct)`.
- Express will execute the first matching `POST /` route and send a response from `createProduct`.
- Because the first route does not call `next()`, the validated route will normally not run.
- Result: product creation currently bypasses `validateProduct`.
- Recommended fix:

```ts
router.post("/", validateProduct, createProduct);
```

and remove:

```ts
router.post("/", createProduct);
```

### `src/middleware/productValidation.ts`

Code used:

```ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
```

Export:

```ts
export const validateProduct = [
  ...
];
```

Functionality:

- Defines validation middleware for product creation.
- Uses `express-validator`.
- Validates important fields before `createProduct`.
- Returns HTTP status `400` if validation fails.
- Calls `next()` if validation passes.

Validation rules:

| Field | Rule | Error message |
| --- | --- | --- |
| `name` | `trim().notEmpty()` | `Product name is required` |
| `category` | `isIn(["men", "women", "kids"])` | `Invalid category` |
| `price` | `isFloat({ min: 0 })` | `Price must be a positive number` |
| `image` | `notEmpty()` | `Main image is required` |
| `description` | `trim().notEmpty()` | `Description is required` |

Final validation handler:

```ts
(req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
    return;
  }

  next();
}
```

Response on validation failure:

```json
{
  "success": false,
  "errors": []
}
```

Important note:

- This middleware is currently imported and registered, but because of the duplicate unvalidated `POST /` route, it is likely bypassed for product creation.

### `src/middleware/notFound.middleware.ts`

Code used:

```ts
import { Request, Response, NextFunction } from "express";
```

Main logic:

```ts
const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error = new Error(
    `Route Not Found - ${req.originalUrl}`
  );

  next(error);
};
```

Functionality:

- Runs after all registered routes.
- Creates an error for unmatched routes.
- Includes the original requested URL in the error message.
- Passes the error to `errorHandler` using `next(error)`.

Important issue:

- This middleware does not set `error.statusCode = 404`.
- The current `errorHandler` defaults to status `500` when `err.statusCode` is missing.
- Result: unknown routes may return HTTP `500` instead of `404`.

Recommended improvement:

```ts
const error = new Error(`Route Not Found - ${req.originalUrl}`) as Error & {
  statusCode?: number;
};
error.statusCode = 404;
next(error);
```

### `src/middleware/error.middleware.ts`

Code used:

```ts
import { Request, Response, NextFunction } from "express";
```

Main logic:

```ts
const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
```

Functionality:

- Central Express error handler.
- Logs errors to the console.
- Sends JSON error responses.
- Uses `err.statusCode` if available.
- Defaults to HTTP status `500`.
- Defaults message to `"Internal Server Error"` if the error has no message.

Response shape:

```json
{
  "success": false,
  "message": "Error message"
}
```

Important note:

- `err` is typed as `any`, which works but gives less TypeScript safety.
- It does not include stack traces, which is simple and safer for production.

### `src/utils/asyncHandler.ts`

Code used:

```ts
import { Request, Response, NextFunction } from "express";
```

Type:

```ts
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;
```

Main logic:

```ts
const asyncHandler =
  (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

Functionality:

- Wraps async Express controllers.
- Converts rejected promises into Express errors.
- Avoids writing `try/catch` in every controller.
- Sends errors to the global `errorHandler`.

Used by:

- `getProducts`
- `createProduct`
- `getProductById`

## API Endpoint Report

### Health Check

| Method | Endpoint | Handler | Response |
| --- | --- | --- | --- |
| `GET` | `/` | inline handler in `app.ts` | API running message |

Example success response:

```json
{
  "success": true,
  "message": "Ecommerce API Running"
}
```

### Product Endpoints

| Method | Endpoint | Request body | Success response | Functionality |
| --- | --- | --- | --- | --- |
| `GET` | `/api/products` | none | `200` with `count` and `data` | Fetches all products from MongoDB. |
| `GET` | `/api/products/:id` | none | `200` with `data` | Fetches one product by id. |
| `POST` | `/api/products` | Product fields | `201` with `data` | Creates a product. Currently validation is bypassed because of duplicate route order. |

Expected product create body:

```json
{
  "name": "Men's Jacket",
  "category": "men",
  "price": 4999,
  "image": "https://example.com/main.jpg",
  "images": ["https://example.com/main.jpg"],
  "description": "Product description",
  "sizes": ["S", "M", "L"],
  "features": ["Feature one", "Feature two"]
}
```

## Data Flow Summary

### Get all products

```text
Client
  GET /api/products
    app.ts
      product.routes.ts
        getProducts
          Product.find()
            MongoDB
          JSON response
```

### Get product by id

```text
Client
  GET /api/products/:id
    app.ts
      product.routes.ts
        getProductById
          Product.findById(req.params.id)
            MongoDB
          JSON response or 404 response
```

### Create product

```text
Client
  POST /api/products
    app.ts
      product.routes.ts
        createProduct
          Product.create(req.body)
            MongoDB
          JSON response
```

Intended validated flow:

```text
Client
  POST /api/products
    validateProduct
      validationResult(req)
      next()
    createProduct
      Product.create(req.body)
```

Current route order prevents this intended validation flow from normally running.

## Error Flow Summary

### Async controller error

```text
Controller throws/rejects
  asyncHandler catches rejection
    next(error)
      errorHandler
        JSON error response
```

### Unknown route

```text
Request does not match any route
  notFound
    creates Error("Route Not Found - ...")
    next(error)
      errorHandler
        JSON error response
```

Current unknown-route status issue:

- Intended: `404`
- Current likely result: `500`
- Reason: `notFound` does not assign `statusCode`.

## Current Implementation Status

Implemented:

- Express app setup
- CORS middleware
- JSON body parsing
- Root health endpoint
- MongoDB connection function
- Product Mongoose schema/model
- Product list controller
- Product create controller
- Product get-by-id controller
- Product route file
- Product validation middleware
- Global error handler
- Not-found middleware
- Async handler utility

Not implemented yet:

- Product update endpoint
- Product delete endpoint
- Product pagination, search, sort, or filters
- Authentication middleware
- Admin authorization
- User model
- Order model
- Cart/order checkout APIs
- File/image upload handling
- `.env.example`
- Automated tests

## Important Current Issues

### Duplicate product creation route

Current code:

```ts
router.post("/", createProduct);
router.post("/", validateProduct, createProduct);
```

Impact:

- Product creation can happen without validation.
- The validated route is effectively unreachable in normal successful create requests.

Recommended code:

```ts
router.post("/", validateProduct, createProduct);
```

### Not-found middleware does not return 404

Current code creates an error but does not set `statusCode`.

Impact:

- Unknown routes may return `500 Internal Server Error` instead of `404 Not Found`.

Recommended behavior:

- Set `error.statusCode = 404` before calling `next(error)`.

### `MONGO_URI` is not checked before connection

Current code casts `process.env.MONGO_URI` to string.

Impact:

- Missing environment variable fails during Mongoose connection instead of giving a clear custom message.

Recommended behavior:

- Check `if (!process.env.MONGO_URI)` and throw a clear startup error.

