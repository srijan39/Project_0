import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model";
import type { IProductVariant } from "../models/product.model";

dotenv.config();

const DRY_RUN = process.argv.includes("--dry-run");

const customStockArg = process.argv.find((a) => a.startsWith("--default-stock="));
const DEFAULT_STOCK = customStockArg
  ? parseInt(customStockArg.split("=")[1], 10)
  : 0;

interface LegacyProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  sizes?: string[];
  colors?: string[];
  variants: IProductVariant[];
}

function buildVariantsFromLegacy(
  sizes: string[],
  colors: string[],
  existingVariants: IProductVariant[],
  defaultStock: number
): IProductVariant[] {
  const existing = new Map<string, IProductVariant>();
  for (const v of existingVariants) {
    existing.set(`${v.color}|${v.size}`, v);
  }

  const resolvedColors = colors.length > 0 ? colors : [""];
  const resolvedSizes = sizes.length > 0 ? sizes : [""];
  const result: IProductVariant[] = [];

  for (const color of resolvedColors) {
    for (const size of resolvedSizes) {
      const key = `${color}|${size}`;
      const existingVariant = existing.get(key);
      result.push({
        color,
        size,
        stock: existingVariant ? existingVariant.stock : defaultStock,
      });
    }
  }

  return result;
}

async function migrateInventory(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in .env");
  }

  await mongoose.connect(mongoUri);

  const products = await Product.collection
    .find<LegacyProduct>({}, { projection: { _id: 1, name: 1, sizes: 1, colors: 1, variants: 1 } })
    .toArray();

  let migrated = 0;
  let skipped = 0;

  for (const product of products) {
    const legacySizes: string[] = product.sizes ?? [];
    const legacyColors: string[] = product.colors ?? [];
    const existingVariants: IProductVariant[] = product.variants ?? [];

    const hasLegacyFields = legacySizes.length > 0 || legacyColors.length > 0;
    const hasVariants = existingVariants.length > 0;

    if (!hasLegacyFields && hasVariants) {
      skipped++;
      continue;
    }

    if (!hasLegacyFields && !hasVariants) {
      skipped++;
      continue;
    }

    const newVariants = buildVariantsFromLegacy(
      legacySizes,
      legacyColors,
      existingVariants,
      DEFAULT_STOCK
    );

    if (!DRY_RUN) {
      await Product.collection.updateOne(
        { _id: product._id },
        {
          $set: { variants: newVariants },
          $unset: { sizes: "", colors: "" },
        }
      );
    }

    migrated++;
  }

  if (!DRY_RUN) {
    process.stdout.write(`Migrated: ${migrated}, Skipped: ${skipped}\n`);
  } else {
    process.stdout.write(`[DRY RUN] Would migrate: ${migrated}, Would skip: ${skipped}\n`);
  }

  await mongoose.disconnect();
}

migrateInventory().catch((error) => {
  process.stderr.write(`Migration failed: ${String(error)}\n`);
  process.exit(1);
});
