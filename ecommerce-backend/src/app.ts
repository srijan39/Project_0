import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";
import notFound from "./middleware/notFound.middleware";
import errorHandler from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Ecommerce API Running",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;