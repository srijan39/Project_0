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
