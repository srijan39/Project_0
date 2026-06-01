import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";
import notFound from "./middleware/notFound.middleware";
import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import adminRoutes from "./routes/admin.routes";
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
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
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
