

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model";
import Inventory from "../models/inventory.model";

dotenv.config();

const DEFAULT_STOCK = 0;
const DEFAULT_LOW_STOCK_THRESHOLD = 5;
const DRY_RUN = process.argv.includes("--dry-run");

const customStockArg = process.argv.find((a) => a.startsWith("--default-stock="));
const RESOLVED_DEFAULT_STOCK = customStockArg
  ? parseInt(customStockArg.split("=")[1], 10)
  : DEFAULT_STOCK;

function generateVariantCombinations(
  sizes: string[],
  colors: string[]
): Array<{ size: string; color: string }> {
  const resolvedSizes = sizes.length > 0 ? sizes : [""];
  const resolvedColors = colors.length > 0 ? colors : [""];

  const combinations: Array<{ size: string; color: string }> = [];

  for (const size of resolvedSizes) {
    for (const color of resolvedColors) {
      combinations.push({ size, color });
    }
  }

  return combinations;
}


async function migrateInventory(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in .env");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Inventory Migration");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (DRY_RUN) {
    console.log("  MODE: DRY RUN — no documents will be written");
  } else {
    console.log(`  MODE: LIVE — default stock per variant: ${RESOLVED_DEFAULT_STOCK}`);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.connect(mongoUri);
  console.log("✓ Connected to MongoDB\n");


  const products = await Product.find({}, { _id: 1, name: 1, sizes: 1, colors: 1 }).lean();

  console.log(`Found ${products.length} products to process.\n`);

  const inventoryDocs: Array<{
    product: mongoose.Types.ObjectId;
    size: string;
    color: string;
    stock: number;
    reserved: number;
    lowStockThreshold: number;
    isActive: boolean;
  }> = [];

  let totalVariants = 0;

  for (const product of products) {
    const combinations = generateVariantCombinations(
      product.sizes ?? [],
      product.colors ?? []
    );

    const sizeLabel = product.sizes?.length
      ? `sizes: [${product.sizes.join(", ")}]`
      : "no sizes";
    const colorLabel = product.colors?.length
      ? `colors: [${product.colors.join(", ")}]`
      : "no colors";

    console.log(
      `  → ${product.name} (${sizeLabel}, ${colorLabel}) — ${combinations.length} variant(s)`
    );

    for (const { size, color } of combinations) {
      const variantLabel = [size, color].filter(Boolean).join(" / ") || "no variant";
      console.log(`      • ${variantLabel} — stock: ${RESOLVED_DEFAULT_STOCK}`);

      inventoryDocs.push({
        product: product._id as mongoose.Types.ObjectId,
        size,
        color,
        stock: RESOLVED_DEFAULT_STOCK,
        reserved: 0,
        lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
        isActive: true,
      });
    }

    totalVariants += combinations.length;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Total variants to insert: ${totalVariants}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (DRY_RUN) {
    console.log("DRY RUN complete — no documents written.");
    await mongoose.disconnect();
    return;
  }

  if (inventoryDocs.length === 0) {
    console.log("No products found. Nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  try {

    const result = await Inventory.insertMany(inventoryDocs, {
      ordered: false,
    });

    console.log(`✓ Inserted ${result.length} new inventory documents.`);
  } catch (error: unknown) {

    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error.name === "MongoBulkWriteError" || error.name === "BulkWriteError")
    ) {
      const bulkError = error as { result?: { nInserted?: number }; writeErrors?: unknown[] };
      const inserted = bulkError.result?.nInserted ?? 0;
      const skipped = (bulkError.writeErrors ?? []).length;

      console.log(`✓ Inserted: ${inserted} new documents`);
      console.log(`  Skipped: ${skipped} already-existing variants (duplicate key — safe)`);
    } else {
      throw error;
    }
  }

  console.log("\n✓ Migration complete.\n");
  await mongoose.disconnect();
}


migrateInventory().catch((error) => {
  console.error("\n✗ Migration failed:", error);
  process.exit(1);
});
