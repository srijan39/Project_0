export interface Product {
  id: number;
  name: string;
  category: "men" | "women" | "kids";
  price: number;
  image: string;
  images: string[];
  description: string;
  sizes: string[];
  features: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "Men's Black Leather Jacket",
    category: "men",
    price: 4999,
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614",
    images: [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614",
    ],
    description:
      "A premium black leather jacket designed for a bold, refined look with everyday comfort and timeless appeal.",
    sizes: ["S", "M", "L", "XL","XXL"],
    
    features: [
      "Premium faux leather finish",
      "Soft inner lining",
      "Classic regular fit",
      "Ideal for casual and evening wear",
    ],
  },
  {
    id: 2,
    name: "Men's White Formal Shirt",
    category: "men",
    price: 1999,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614",
      "https://images.unsplash.com/photo-1542272604-787c3835535d",
    ],
    description:
      "A crisp white formal shirt tailored for clean styling, office wear, and versatile everyday elegance.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Breathable cotton blend",
      "Tailored fit",
      "Button-down front",
      "Perfect for formal occasions",
    ],
  },
  {
    id: 3,
    name: "Men's Blue Denim Jeans",
    category: "men",
    price: 2499,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d",
    ],
    description:
      "Classic blue denim jeans with a modern fit, built for all-day comfort and effortless styling.",
    sizes: ["30", "32", "34", "36"],
    features: [
      "Durable denim fabric",
      "Mid-rise fit",
      "Everyday essential styling",
      "Easy movement and comfort",
    ],
  },
  {
    id: 4,
    name: "Men's Casual Hoodie",
    category: "men",
    price: 1799,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990",
    ],
    description:
      "A soft casual hoodie made for laid-back comfort, layering, and easy street-style looks.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Soft fleece interior",
      "Adjustable hood",
      "Relaxed fit",
      "Warm and comfortable",
    ],
  },
  {
    id: 5,
    name: "Men's Grey Sweatshirt",
    category: "men",
    price: 1599,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    ],
    description:
      "A clean grey sweatshirt with a minimal look, ideal for daily wear and cool-weather comfort.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Soft brushed fabric",
      "Minimal modern look",
      "Comfort fit",
      "Ribbed cuffs and hem",
    ],
  },
  {
    id: 6,
    name: "Men's Black Slim T-Shirt",
    category: "men",
    price: 999,
    image: "https://images.unsplash.com/photo-1523381294911-8d3cead13475",
    images: [
      "https://images.unsplash.com/photo-1523381294911-8d3cead13475",
    ],
    description:
      "A sleek slim-fit black t-shirt crafted for a sharp silhouette and everyday versatility.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Soft cotton fabric",
      "Slim fit profile",
      "Stretch comfort",
      "Minimal everyday staple",
    ],
  },
  {
    id: 7,
    name: "Men's Olive Chinos",
    category: "men",
    price: 2199,
    image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
    images: [
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
    ],
    description:
      "Modern olive chinos with a polished casual look, perfect for smart everyday dressing.",
    sizes: ["30", "32", "34", "36"],
    features: [
      "Smooth cotton twill",
      "Slim tapered fit",
      "Clean smart-casual style",
      "Comfort waistband",
    ],
  },
  {
    id: 8,
    name: "Men's Sports Track Pants",
    category: "men",
    price: 1499,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    ],
    description:
      "Performance-inspired track pants built for comfort, flexibility, and active everyday wear.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Lightweight stretch fabric",
      "Athletic fit",
      "Elastic waistband",
      "Suitable for workouts and lounging",
    ],
  },
  {
    id: 9,
    name: "Men's Checked Casual Shirt",
    category: "men",
    price: 1899,
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c",
    images: [
      "https://images.unsplash.com/photo-1516826957135-700dedea698c",
    ],
    description:
      "A checked casual shirt with relaxed charm, perfect for layering or everyday wear.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Soft woven fabric",
      "Classic checked pattern",
      "Button-down closure",
      "Comfortable regular fit",
    ],
  },
  {
    id: 10,
    name: "Men's Winter Bomber Jacket",
    category: "men",
    price: 3999,
    image: "https://images.unsplash.com/photo-1520975682031-a4a1f3e3c1b6",
    images: [
      "https://images.unsplash.com/photo-1520975682031-a4a1f3e3c1b6",
    ],
    description:
      "A winter-ready bomber jacket combining warmth, structure, and standout casual styling.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Warm padded construction",
      "Classic bomber silhouette",
      "Zip-front closure",
      "Cold-weather layering essential",
    ],
  },
  {
    id: 11,
    name: "Men's Polo T-Shirt",
    category: "men",
    price: 1299,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    ],
    description:
      "A premium polo t-shirt that blends smart polish with comfortable everyday wear.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Collared polo style",
      "Soft breathable fabric",
      "Smart-casual versatility",
      "Clean tailored look",
    ],
  },
  {
    id: 12,
    name: "Men's Formal Blazer",
    category: "men",
    price: 6999,
    image: "https://images.unsplash.com/photo-1593032465175-481ac7f4019b",
    images: [
      "https://images.unsplash.com/photo-1593032465175-481ac7f4019b",
    ],
    description:
      "A refined formal blazer tailored for elevated occasions, office wear, and sharp styling.",
    sizes: ["M", "L", "XL"],
    features: [
      "Structured tailoring",
      "Premium finish",
      "Formal event ready",
      "Classic lapel design",
    ],
  },
  {
    id: 13,
    name: "Men's Sleeveless Gym Vest",
    category: "men",
    price: 799,
    image: "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e",
    images: [
      "https://images.unsplash.com/photo-1598971861713-54ad16a7e72e",
    ],
    description:
      "A lightweight sleeveless vest built for mobility, airflow, and training comfort.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Breathable activewear fabric",
      "Sleeveless athletic cut",
      "Quick movement comfort",
      "Ideal for workouts",
    ],
  },
  {
    id: 14,
    name: "Men's Linen Summer Shirt",
    category: "men",
    price: 2299,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157",
    images: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157",
    ],
    description:
      "A light linen summer shirt designed to keep you cool, fresh, and effortlessly stylish.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Lightweight linen blend",
      "Breathable and airy",
      "Relaxed summer styling",
      "Soft premium finish",
    ],
  },
  {
    id: 15,
    name: "Men's Black Overcoat",
    category: "men",
    price: 7999,
    image: "https://images.unsplash.com/photo-1542060748-10c28b62716f",
    images: [
      "https://images.unsplash.com/photo-1542060748-10c28b62716f",
    ],
    description:
      "A timeless black overcoat with a sophisticated silhouette for elevated winter dressing.",
    sizes: ["M", "L", "XL"],
    features: [
      "Longline premium silhouette",
      "Warm structured fabric",
      "Classic formal styling",
      "Ideal for colder seasons",
    ],
  },
  {
    id: 16,
    name: "Women's Beige Trench Coat",
    category: "women",
    price: 5499,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
    ],
    description:
      "A timeless beige trench coat crafted for elegant layering and elevated seasonal style.",
    sizes: ["S", "M", "L"],
    features: [
      "Classic trench silhouette",
      "Elegant neutral tone",
      "Lightweight layering piece",
      "Refined modern finish",
    ],
  },
  {
    id: 17,
    name: "Women's Floral Summer Dress",
    category: "women",
    price: 2999,
    image: "https://images.unsplash.com/photo-1520974735194-8c6f47f7b52b",
    images: [
      "https://images.unsplash.com/photo-1520974735194-8c6f47f7b52b",
    ],
    description:
      "A breezy floral summer dress designed for comfort, freshness, and effortless elegance.",
    sizes: ["S", "M", "L"],
    features: [
      "Lightweight flowy fabric",
      "Soft floral print",
      "Comfortable silhouette",
      "Perfect for warm weather",
    ],
  },
  {
    id: 18,
    name: "Women's High-Waist Jeans",
    category: "women",
    price: 2699,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    ],
    description:
      "Flattering high-waist jeans with a contemporary fit for confident everyday styling.",
    sizes: ["28", "30", "32", "34"],
    features: [
      "High-rise waistline",
      "Structured denim",
      "Comfort stretch fit",
      "Stylish everyday staple",
    ],
  },
  {
    id: 19,
    name: "Women's Knit Sweater",
    category: "women",
    price: 2299,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    ],
    description:
      "A cozy knit sweater with a soft touch and polished design for effortless cold-weather wear.",
    sizes: ["S", "M", "L"],
    features: [
      "Warm knit texture",
      "Soft comfortable feel",
      "Relaxed fit",
      "Ideal for layering",
    ],
  },
  {
    id: 20,
    name: "Women's Black Crop Top",
    category: "women",
    price: 999,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    ],
    description:
      "A sleek black crop top designed for versatile styling, comfort, and a confident silhouette.",
    sizes: ["S", "M", "L"],
    features: [
      "Soft stretch fabric",
      "Modern cropped length",
      "Minimal styling",
      "Easy everyday wear",
    ],
  },
  {
    id: 21,
    name: "Women's Pleated Skirt",
    category: "women",
    price: 1799,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    ],
    description:
      "A flowing pleated skirt that adds elegance, movement, and timeless femininity to any look.",
    sizes: ["S", "M", "L"],
    features: [
      "Elegant pleated finish",
      "Lightweight drape",
      "Comfort waistband",
      "Versatile styling piece",
    ],
  },
  {
    id: 22,
    name: "Women's Denim Jacket",
    category: "women",
    price: 3299,
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614",
    images: [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614",
    ],
    description:
      "A versatile denim jacket with a classic feel, ideal for layering across seasons.",
    sizes: ["S", "M", "L"],
    features: [
      "Classic denim structure",
      "Layering essential",
      "Button-front style",
      "Everyday casual versatility",
    ],
  },
  {
    id: 23,
    name: "Women's Formal Blouse",
    category: "women",
    price: 1599,
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7",
    images: [
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7",
    ],
    description:
      "A polished formal blouse made for smart office dressing and elegant daily wear.",
    sizes: ["S", "M", "L"],
    features: [
      "Smooth lightweight fabric",
      "Refined office-ready style",
      "Comfortable tailored fit",
      "Minimal elegant finish",
    ],
  },
  {
    id: 24,
    name: "Women's Lounge Wear Set",
    category: "women",
    price: 2499,
    image: "https://images.unsplash.com/photo-1520975682031-a4a1f3e3c1b6",
    images: [
      "https://images.unsplash.com/photo-1520975682031-a4a1f3e3c1b6",
    ],
    description:
      "A cozy lounge wear set combining softness, comfort, and laid-back premium styling.",
    sizes: ["S", "M", "L"],
    features: [
      "Soft coordinated set",
      "Relaxed fit",
      "Comfort-first design",
      "Ideal for home and casual wear",
    ],
  },
  {
    id: 25,
    name: "Women's Winter Coat",
    category: "women",
    price: 6499,
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    images: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    ],
    description:
      "A warm winter coat with elegant structure and timeless seasonal sophistication.",
    sizes: ["S", "M", "L"],
    features: [
      "Warm insulated feel",
      "Elegant longline silhouette",
      "Seasonal outerwear staple",
      "Refined finish",
    ],
  },
  {
    id: 26,
    name: "Women's Cotton Kurti",
    category: "women",
    price: 1899,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    images: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    ],
    description:
      "A breathable cotton kurti with graceful styling, designed for comfort and everyday charm.",
    sizes: ["S", "M", "L", "XL"],
    features: [
      "Soft cotton comfort",
      "Traditional-meets-modern styling",
      "Breathable fabric",
      "All-day wearability",
    ],
  },
  {
    id: 27,
    name: "Women's Wide Leg Pants",
    category: "women",
    price: 2199,
    image: "https://images.unsplash.com/photo-1520974735194-8c6f47f7b52b",
    images: [
      "https://images.unsplash.com/photo-1520974735194-8c6f47f7b52b",
    ],
    description:
      "Wide leg pants with a fluid fit and refined silhouette for modern effortless dressing.",
    sizes: ["28", "30", "32", "34"],
    features: [
      "Relaxed wide-leg fit",
      "Soft drape",
      "Comfort waistband",
      "Minimal sophisticated style",
    ],
  },
  {
    id: 28,
    name: "Women's Silk Saree",
    category: "women",
    price: 9999,
    image: "https://images.unsplash.com/photo-1593032465175-481ac7f4019b",
    images: [
      "https://images.unsplash.com/photo-1593032465175-481ac7f4019b",
    ],
    description:
      "A luxurious silk saree crafted for festive elegance, premium occasion wear, and timeless beauty.",
    sizes: ["Free Size"],
    features: [
      "Premium silk texture",
      "Elegant festive styling",
      "Rich traditional appeal",
      "Graceful drape",
    ],
  },
  {
    id: 29,
    name: "Women's Hoodie",
    category: "women",
    price: 1999,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157",
    images: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157",
    ],
    description:
      "A cozy women’s hoodie that blends everyday comfort with clean, minimal styling.",
    sizes: ["S", "M", "L"],
    features: [
      "Soft inner texture",
      "Relaxed silhouette",
      "Comfortable everyday essential",
      "Easy layering option",
    ],
  },
  {
    id: 30,
    name: "Women's Sleeveless Top",
    category: "women",
    price: 899,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    ],
    description:
      "A lightweight sleeveless top designed for warm-weather ease and effortless styling.",
    sizes: ["S", "M", "L"],
    features: [
      "Lightweight breathable fabric",
      "Easy casual styling",
      "Minimal sleeveless cut",
      "Comfort-first fit",
    ],
  },
  {
    id: 31,
    name: "Kids Cartoon Hoodie",
    category: "kids",
    price: 1499,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    ],
    description:
      "A fun cartoon hoodie designed to keep kids warm, playful, and comfortable all day.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Soft cozy fabric",
      "Playful printed design",
      "Warm hooded style",
      "Kid-friendly comfort",
    ],
  },
  {
    id: 32,
    name: "Kids Denim Jacket",
    category: "kids",
    price: 1899,
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30",
    images: [
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30",
    ],
    description:
      "A stylish kids denim jacket built for layering, movement, and everyday charm.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Classic denim look",
      "Durable feel",
      "Layering essential",
      "Comfortable fit for kids",
    ],
  },
  {
    id: 33,
    name: "Kids Cotton T-Shirt",
    category: "kids",
    price: 799,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1c1",
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1c1",
    ],
    description:
      "A soft cotton t-shirt made for daily comfort, playtime, and all-day ease.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Soft breathable cotton",
      "Gentle on skin",
      "Easy everyday wear",
      "Lightweight and comfortable",
    ],
  },
  {
    id: 34,
    name: "Kids Winter Tracksuit",
    category: "kids",
    price: 2199,
    image: "https://images.unsplash.com/photo-1542060748-10c28b62716f",
    images: [
      "https://images.unsplash.com/photo-1542060748-10c28b62716f",
    ],
    description:
      "A warm winter tracksuit built for comfort, movement, and playful everyday activity.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Warm coordinated set",
      "Soft inner feel",
      "Easy movement",
      "Cold-weather comfort",
    ],
  },
  {
    id: 35,
    name: "Kids Printed Pajamas",
    category: "kids",
    price: 999,
    image: "https://images.unsplash.com/photo-1602810318406-ec8a7c2d2d4b",
    images: [
      "https://images.unsplash.com/photo-1602810318406-ec8a7c2d2d4b",
    ],
    description:
      "Comfortable printed pajamas made for cozy nights and gentle all-night comfort.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Soft sleepwear fabric",
      "Cute playful prints",
      "Relaxed bedtime comfort",
      "Gentle on skin",
    ],
  },
  {
    id: 36,
    name: "Kids Party Dress",
    category: "kids",
    price: 2499,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
    ],
    description:
      "A charming party dress designed for special moments, comfort, and playful elegance.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Elegant party styling",
      "Comfortable festive wear",
      "Soft fabric feel",
      "Kid-friendly fit",
    ],
  },
  {
    id: 37,
    name: "Kids Casual Shorts",
    category: "kids",
    price: 699,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1c1",
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1c1",
    ],
    description:
      "Easy casual shorts made for active kids, warm days, and comfortable movement.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Lightweight fabric",
      "Comfort waistband",
      "Easy movement",
      "Everyday casual wear",
    ],
  },
  {
    id: 38,
    name: "Kids Hooded Jacket",
    category: "kids",
    price: 1999,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    ],
    description:
      "A warm hooded jacket for kids designed for outdoor comfort and everyday layering.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Warm outer layer",
      "Comfortable hooded design",
      "Kid-friendly fit",
      "Practical everyday wear",
    ],
  },
  {
    id: 39,
    name: "Kids School Uniform Set",
    category: "kids",
    price: 1799,
    image: "https://images.unsplash.com/photo-1542060748-10c28b62716f",
    images: [
      "https://images.unsplash.com/photo-1542060748-10c28b62716f",
    ],
    description:
      "A neat school uniform set crafted for comfort, durability, and a polished look.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Durable schoolwear fabric",
      "Comfortable structured fit",
      "Easy all-day wear",
      "Clean smart appearance",
    ],
  },
  {
    id: 40,
    name: "Kids Sweatshirt",
    category: "kids",
    price: 1199,
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30",
    images: [
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30",
    ],
    description:
      "A soft sweatshirt made for everyday comfort, warmth, and playful movement.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Soft brushed interior",
      "Casual everyday comfort",
      "Warm and lightweight",
      "Relaxed fit",
    ],
  },
  {
    id: 41,
    name: "Kids Summer Dress",
    category: "kids",
    price: 1599,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
    ],
    description:
      "A breezy summer dress designed for comfort, movement, and cheerful everyday style.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Lightweight fabric",
      "Comfortable airy fit",
      "Cute seasonal styling",
      "Easy to wear",
    ],
  },
  {
    id: 42,
    name: "Kids Printed Shirt",
    category: "kids",
    price: 899,
    image: "https://images.unsplash.com/photo-1602810318406-ec8a7c2d2d4b",
    images: [
      "https://images.unsplash.com/photo-1602810318406-ec8a7c2d2d4b",
    ],
    description:
      "A playful printed shirt that combines comfort, color, and fun everyday styling.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Colorful printed design",
      "Soft woven fabric",
      "Easy casual styling",
      "Comfort-focused fit",
    ],
  },
  {
    id: 43,
    name: "Kids Jogger Pants",
    category: "kids",
    price: 1299,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1c1",
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1c1",
    ],
    description:
      "Comfortable jogger pants built for active kids, daily play, and all-day ease.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Elasticated waistband",
      "Relaxed jogger fit",
      "Easy movement",
      "Soft everyday fabric",
    ],
  },
  {
    id: 44,
    name: "Kids Winter Cap Set",
    category: "kids",
    price: 599,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    ],
    description:
      "A cozy winter cap set designed to keep little ones warm and comfortable in cold weather.",
    sizes: ["Free Size"],
    features: [
      "Soft warm knit",
      "Winter-ready comfort",
      "Gentle fit",
      "Essential cold-weather accessory",
    ],
  },
  {
    id: 45,
    name: "Kids Festive Kurta Set",
    category: "kids",
    price: 2999,
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
    ],
    description:
      "A festive kurta set for kids combining traditional charm with comfort and celebration-ready style.",
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    features: [
      "Festive traditional design",
      "Comfortable coordinated set",
      "Soft occasion-wear fabric",
      "Elegant celebratory look",
    ],
  },
];