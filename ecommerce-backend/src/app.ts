import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";
import notFound from "./middleware/notFound.middleware";
import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import adminRoutes from "./routes/admin.routes";
import orderRoutes from "./routes/order.routes";

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Ecommerce API Running",
  });
});
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
