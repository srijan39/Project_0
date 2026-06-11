import { useMemo, useState } from "react";
import { createProductsBulk } from "../api/products";
import { getApiErrorMessage } from "../api/axios";
import type { ProductCategory, ProductInput } from "../types/product";

type UploadMode = "json" | "csv";

interface ValidationIssue {
  row: number;
  message: string;
}

interface UploadSummary {
  total: number;
  successful: number;
  failed: number;
  failures: ValidationIssue[];
}

const categories: ProductCategory[] = ["men", "women", "kids"];

const sampleJson = `[
  {
    "name": "Premium Hoodie",
    "category": "men",
    "price": 2499,
    "image": "https://...",
    "images": ["https://..."],
    "description": "Premium cotton hoodie",
    "sizes": ["S", "M", "L"],
    "colors": ["Black", "White"],
    "features": ["Soft", "Comfortable"]
  }
]`;

const sampleCsv =
  'name,category,price,image,description,sizes,colors,features\nPremium Hoodie,men,2499,https://...,Premium cotton hoodie,"S|M|L","Black|White","Soft|Comfortable"';

const emptySummary: UploadSummary = {
  total: 0,
  successful: 0,
  failed: 0,
  failures: [],
};

const splitPipeList = (value: string | undefined) =>
  (value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentValue += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  if (insideQuotes) {
    throw new Error("Invalid CSV: unmatched quote");
  }

  values.push(currentValue.trim());
  return values;
};

const parseCsv = (content: string) => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV must include a header and at least one product row");
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const requiredHeaders = ["name", "category", "price", "image", "description"];
  const missingHeader = requiredHeaders.find(
    (header) => !headers.includes(header)
  );

  if (missingHeader) {
    throw new Error(`CSV is missing required header: ${missingHeader}`);
  }

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = headers.reduce<Record<string, string>>((result, header, index) => {
      result[header] = values[index] ?? "";
      return result;
    }, {});

    return {
      name: row.name ?? "",
      category: row.category ?? "",
      price: row.price ?? "",
      image: row.image ?? "",
      images: splitPipeList(row.images),
      description: row.description ?? "",
      sizes: splitPipeList(row.sizes),
      colors: splitPipeList(row.colors),
      features: splitPipeList(row.features),
    };
  });
};

const parseJson = (content: string) => {
  const parsed = JSON.parse(content) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of products");
  }

  return parsed.map((item) => {
    if (!isRecord(item)) {
      return {};
    }

    return {
      name: asString(item.name),
      category: asString(item.category),
      price: item.price,
      image: asString(item.image),
      images: asStringArray(item.images),
      description: asString(item.description),
      sizes: asStringArray(item.sizes),
      colors: asStringArray(item.colors),
      features: asStringArray(item.features),
    };
  });
};

const validateProducts = (items: unknown[]) => {
  const products: ProductInput[] = [];
  const failures: ValidationIssue[] = [];

  items.forEach((item, index) => {
    const row = index + 1;

    if (!isRecord(item)) {
      failures.push({ row, message: "Product must be an object" });
      return;
    }

    const name = asString(item.name);
    const category = asString(item.category) as ProductCategory;
    const price =
      typeof item.price === "number" ? item.price : Number(asString(item.price));
    const image = asString(item.image);
    const description = asString(item.description);
    const images = asStringArray(item.images);
    const sizes = asStringArray(item.sizes);
    const colors = asStringArray(item.colors);
    const features = asStringArray(item.features);

    if (!name) {
      failures.push({ row, message: "Name is required" });
    }

    if (!categories.includes(category)) {
      failures.push({ row, message: "Category must be men, women, or kids" });
    }

    if (!Number.isFinite(price) || price < 0) {
      failures.push({ row, message: "Price must be a positive number" });
    }

    if (!image) {
      failures.push({ row, message: "Main image is required" });
    }

    if (!description) {
      failures.push({ row, message: "Description is required" });
    }

    if (failures.some((failure) => failure.row === row)) {
      return;
    }

    products.push({
      name,
      category,
      price,
      image,
      images,
      description,
      sizes,
      colors,
      features,
    });
  });

  return { products, failures };
};

const countFailedRows = (failures: ValidationIssue[]) =>
  new Set(failures.map((failure) => failure.row)).size;

const ProductBulkUpload = () => {
  const [mode, setMode] = useState<UploadMode>("json");
  const [content, setContent] = useState(sampleJson);
  const [previewProducts, setPreviewProducts] = useState<ProductInput[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>(
    []
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<UploadSummary>(emptySummary);

  const canUpload = previewProducts.length > 0 && validationIssues.length === 0;

  const previewRows = useMemo(
    () => previewProducts.slice(0, 120),
    [previewProducts]
  );

  const resetPreview = () => {
    setPreviewProducts([]);
    setValidationIssues([]);
    setSummary(emptySummary);
    setErrorMessage("");
  };

  const handleModeChange = (nextMode: UploadMode) => {
    setMode(nextMode);
    setContent(nextMode === "json" ? sampleJson : sampleCsv);
    resetPreview();
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;

    setContent(await file.text());
    resetPreview();
  };

  const handlePreview = () => {
    setErrorMessage("");
    setSummary(emptySummary);

    try {
      const parsed = mode === "json" ? parseJson(content) : parseCsv(content);
      const { products, failures } = validateProducts(parsed);

      setPreviewProducts(products);
      setValidationIssues(failures);

      if (failures.length > 0) {
        setSummary({
          total: parsed.length,
          successful: products.length,
          failed: countFailedRows(failures),
          failures,
        });
      }
    } catch (error) {
      setPreviewProducts([]);
      setValidationIssues([]);
      setErrorMessage(error instanceof Error ? error.message : "Invalid upload");
    }
  };

  const handleUpload = async () => {
    if (!canUpload || isUploading) return;

    setIsUploading(true);
    setErrorMessage("");
    setSummary(emptySummary);

    try {
      const response = (await createProductsBulk(previewProducts)) as {
        count?: number;
        data?: ProductInput[];
      };
      const successful = response.count ?? response.data?.length ?? 0;

      setSummary({
        total: previewProducts.length,
        successful,
        failed: previewProducts.length - successful,
        failures: [],
      });
      setPreviewProducts([]);
    } catch (error) {
      const message = getApiErrorMessage(error);
      setSummary({
        total: previewProducts.length,
        successful: 0,
        failed: previewProducts.length,
        failures: [{ row: 0, message }],
      });
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Bulk Upload
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Import products with JSON or CSV and review before upload.
          </p>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => handleModeChange("json")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              mode === "json"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            JSON
          </button>
          <button
            onClick={() => handleModeChange("csv")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              mode === "csv"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-semibold text-slate-700">
            {mode === "json" ? "JSON Products" : "CSV Products"}
          </label>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Choose CSV/JSON File
            <input
              type="file"
              accept={mode === "json" ? ".json,application/json" : ".csv,text/csv"}
              className="sr-only"
              onChange={(event) => void handleFileUpload(event.target.files?.[0])}
            />
          </label>
        </div>

        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            resetPreview();
          }}
          rows={14}
          spellCheck={false}
          className="mt-4 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={handlePreview}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            Validate Preview
          </button>
          <button
            onClick={handleUpload}
            disabled={!canUpload || isUploading}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Uploading..." : "Upload Products"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {validationIssues.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-amber-900">Validation Errors</h2>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
            {validationIssues.map((issue, index) => (
              <p key={`${issue.row}-${index}`} className="text-sm text-amber-800">
                Row {issue.row}: {issue.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {summary.total > 0 && (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Processed
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {summary.total}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Successful
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {summary.successful}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Failed
            </p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {summary.failed}
            </p>
          </div>

          {summary.failures.length > 0 && (
            <div className="sm:col-span-3">
              <h2 className="text-sm font-bold text-slate-950">
                Failure Details
              </h2>
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
                {summary.failures.map((failure, index) => (
                  <p
                    key={`${failure.row}-${index}`}
                    className="text-sm text-slate-700"
                  >
                    {failure.row > 0 ? `Row ${failure.row}: ` : ""}
                    {failure.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-bold text-slate-950">Preview</h2>
          <p className="mt-1 text-sm text-slate-500">
            {previewProducts.length} valid products ready to upload.
          </p>
        </div>

        {previewRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Sizes</th>
                  <th className="px-4 py-3">Colors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((product, index) => (
                  <tr key={`${product.name}-${index}`}>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.price}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.sizes.join(", ") || "None"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.colors.join(", ") || "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <h2 className="text-base font-semibold text-slate-950">
              No preview yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Validate your upload content to review products here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductBulkUpload;
