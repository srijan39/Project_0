import mongoose, { Document, Schema, Types, Model } from "mongoose";


export interface IInventory extends Document {

  product: Types.ObjectId;


  size: string;

  color: string;


  stock: number;

  reserved: number;

  lowStockThreshold: number;
  sku?: string;


  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryModel extends Model<IInventory> {

  findVariant(
    productId: Types.ObjectId | string,
    size: string | undefined,
    color: string | undefined
  ): Promise<IInventory | null>;


  hasStock(
    productId: Types.ObjectId | string,
    size: string | undefined,
    color: string | undefined,
    requiredQty: number
  ): Promise<boolean>;

  decrementStock(
    productId: Types.ObjectId | string,
    size: string | undefined,
    color: string | undefined,
    qty: number,
    session?: mongoose.ClientSession
  ): Promise<IInventory | null>;

  incrementStock(
    productId: Types.ObjectId | string,
    size: string | undefined,
    color: string | undefined,
    qty: number,
    session?: mongoose.ClientSession
  ): Promise<IInventory | null>;


  upsertVariant(
    productId: Types.ObjectId | string,
    size: string | undefined,
    color: string | undefined,
    stock: number,
    options?: {
      lowStockThreshold?: number;
      sku?: string;
      isActive?: boolean;
    }
  ): Promise<IInventory>;


  getProductVariants(
    productId: Types.ObjectId | string
  ): Promise<IInventory[]>;

  setProductVariants(
    productId: Types.ObjectId | string,
    variants: Array<{
      size?: string;
      color?: string;
      stock: number;
      lowStockThreshold?: number;
      sku?: string;
    }>
  ): Promise<IInventory[]>;
}


const normalizeVariantKey = (value: string | undefined | null): string =>
  typeof value === "string" && value.trim() ? value.trim() : "";


const inventorySchema = new Schema<IInventory, IInventoryModel>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    reserved: {
      type: Number,
      required: true,
      min: [0, "Reserved count cannot be negative"],
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      required: true,
      min: [0, "Low stock threshold cannot be negative"],
      default: 5,
    },

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


inventorySchema.index(
  { product: 1, size: 1, color: 1 },
  { unique: true, name: "idx_inventory_variant_unique" }
);

inventorySchema.index(
  { product: 1 },
  { name: "idx_inventory_product" }
);


inventorySchema.index(
  { stock: 1 },
  { name: "idx_inventory_stock" }
);


inventorySchema.index(
  { product: 1, isActive: 1, stock: 1 },
  { name: "idx_inventory_product_active_stock" }
);

inventorySchema.index(
  { sku: 1 },
  { unique: true, sparse: true, name: "idx_inventory_sku" }
);


inventorySchema.virtual("availableStock").get(function (
  this: IInventory
): number {
  return Math.max(0, this.stock - this.reserved);
});

inventorySchema.virtual("isLowStock").get(function (this: IInventory): boolean {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

inventorySchema.virtual("isOutOfStock").get(function (
  this: IInventory
): boolean {
  return this.stock <= 0;
});

inventorySchema.statics.findVariant = async function (
  productId: Types.ObjectId | string,
  size: string | undefined,
  color: string | undefined
): Promise<IInventory | null> {
  return this.findOne({
    product: productId,
    size: normalizeVariantKey(size),
    color: normalizeVariantKey(color),
  });
};

inventorySchema.statics.hasStock = async function (
  productId: Types.ObjectId | string,
  size: string | undefined,
  color: string | undefined,
  requiredQty: number
): Promise<boolean> {
  const inventory = await this.findOne({
    product: productId,
    size: normalizeVariantKey(size),
    color: normalizeVariantKey(color),
    isActive: true,
  });

  if (!inventory) return false;

  const available = Math.max(0, inventory.stock - inventory.reserved);
  return available >= requiredQty;
};

inventorySchema.statics.decrementStock = async function (
  productId: Types.ObjectId | string,
  size: string | undefined,
  color: string | undefined,
  qty: number,
  session?: mongoose.ClientSession
): Promise<IInventory | null> {
  const normalizedSize = normalizeVariantKey(size);
  const normalizedColor = normalizeVariantKey(color);

  return this.findOneAndUpdate(
    {
      product: productId,
      size: normalizedSize,
      color: normalizedColor,
      stock: { $gte: qty },
    },
    { $inc: { stock: -qty } },
    { new: true, session }
  );
};

inventorySchema.statics.incrementStock = async function (
  productId: Types.ObjectId | string,
  size: string | undefined,
  color: string | undefined,
  qty: number,
  session?: mongoose.ClientSession
): Promise<IInventory | null> {
  return this.findOneAndUpdate(
    {
      product: productId,
      size: normalizeVariantKey(size),
      color: normalizeVariantKey(color),
    },
    { $inc: { stock: qty } },
    { new: true, session }
  );
};

inventorySchema.statics.upsertVariant = async function (
  productId: Types.ObjectId | string,
  size: string | undefined,
  color: string | undefined,
  stock: number,
  options: {
    lowStockThreshold?: number;
    sku?: string;
    isActive?: boolean;
  } = {}
): Promise<IInventory> {
  const normalizedSize = normalizeVariantKey(size);
  const normalizedColor = normalizeVariantKey(color);

  const setFields: Record<string, unknown> = {
    stock,
    isActive: options.isActive ?? true,
  };

  if (options.lowStockThreshold !== undefined) {
    setFields.lowStockThreshold = options.lowStockThreshold;
  }

  if (options.sku !== undefined) {
    setFields.sku = options.sku.trim().toUpperCase();
  }

  const result = await this.findOneAndUpdate(
    {
      product: productId,
      size: normalizedSize,
      color: normalizedColor,
    },
    {
      $set: setFields,
      $setOnInsert: {
        product: productId,
        size: normalizedSize,
        color: normalizedColor,
        reserved: 0,
        lowStockThreshold: options.lowStockThreshold ?? 5,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return result!;
};

inventorySchema.statics.getProductVariants = async function (
  productId: Types.ObjectId | string
): Promise<IInventory[]> {
  return this.find({ product: productId }).sort({ size: 1, color: 1 });
};

inventorySchema.statics.setProductVariants = async function (
  productId: Types.ObjectId | string,
  variants: Array<{
    size?: string;
    color?: string;
    stock: number;
    lowStockThreshold?: number;
    sku?: string;
  }>
): Promise<IInventory[]> {
  const results = await Promise.all(
    variants.map((v) =>
      (this as IInventoryModel).upsertVariant(
        productId,
        v.size,
        v.color,
        v.stock,
        {
          lowStockThreshold: v.lowStockThreshold,
          sku: v.sku,
          isActive: true,
        }
      )
    )
  );

  return results;
};


const Inventory = mongoose.model<IInventory, IInventoryModel>(
  "Inventory",
  inventorySchema
);

export default Inventory;
