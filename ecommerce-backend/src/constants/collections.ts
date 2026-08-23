export const COLLECTION_TAGS = [
  { label: "T-Shirts", slug: "t-shirts" },
  { label: "Sweatshirts", slug: "sweatshirts" },
  { label: "Joggers", slug: "joggers" },
  { label: "Premium HD Tees", slug: "premium-hd-tees" },
  { label: "Polos", slug: "polos" },
  { label: "Co-Ord Sets", slug: "co-ord-sets" },
  { label: "Activewear", slug: "activewear" },
  { label: "Shorts", slug: "shorts" },
  { label: "Hoodies", slug: "hoodies" },
  { label: "Cargo Pants", slug: "cargo-pants" },
  { label: "Travel Essentials", slug: "travel-essentials" },
  { label: "Tracksuits", slug: "tracksuits" },
] as const;

export type CollectionTagSlug = (typeof COLLECTION_TAGS)[number]["slug"];

const collectionTagSlugs = new Set<string>(
  COLLECTION_TAGS.map((tag) => tag.slug)
);

export const slugifyCollectionTag = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isCollectionTagSlug = (
  value: string
): value is CollectionTagSlug => collectionTagSlugs.has(value);

export const normalizeCollectionTags = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map(slugifyCollectionTag)
        .filter(isCollectionTagSlug)
    ),
  ];
};
