/**
 * Public catalogue of the original store, exported read-only from its database
 * (stores / categories / products / shipping zones and rates, allowlisted fields).
 * No users, orders, owner, payment or contact data. Used only by seed-demo.ts.
 */
export interface CatalogueItem {
  name: string; description: string; price: number; discount: number; stock: number;
  category: string; images: string[]; sizes: string[]; averageRating: number; reviewCount: number;
}
export interface ShippingZoneSeed { key: string; name: string; countries: string[]; isActive: boolean; sortOrder: number; }
export interface ShippingRateSeed {
  zoneKey: string; name: string; description: string; type: string; flatAmount: number;
  freeOverThreshold: number | null; tiers: Array<{ minSubtotal: number; maxSubtotal: number | null; amount: number }>;
  isActive: boolean; sortOrder: number;
}
export const STORE_PUBLIC = {
  "name": "Hamroush Store",
  "currency": "EGP",
  "theme": "minimal",
  "logoUrl": "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778700503/store-logos/zwiu9tcwkqtv1bvipurl.jpg"
};
export const CATEGORY_TREE: Array<{ slug: string; name: string; parent?: string }> = [
  {
    "slug": "electronics",
    "name": "Electronics"
  },
  {
    "slug": "clothing",
    "name": "Clothing"
  },
  {
    "slug": "home-garden",
    "name": "Home & Garden"
  },
  {
    "slug": "phones",
    "name": "Phones",
    "parent": "electronics"
  },
  {
    "slug": "laptops",
    "name": "Laptops",
    "parent": "electronics"
  },
  {
    "slug": "accessories",
    "name": "Accessories",
    "parent": "electronics"
  },
  {
    "slug": "mens",
    "name": "Men's",
    "parent": "clothing"
  },
  {
    "slug": "womens",
    "name": "Women's",
    "parent": "clothing"
  },
  {
    "slug": "furniture",
    "name": "Furniture",
    "parent": "home-garden"
  }
];
export const CATALOGUE: CatalogueItem[] = [
  {
    "name": "iPhone 15 Pro",
    "description": "Apple iPhone 15 Pro with A17 Pro chip, titanium design, and 48MP camera system. Features ProMotion display and USB-C connectivity.",
    "price": 999.99,
    "discount": 20,
    "stock": 23,
    "category": "phones",
    "images": [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&q=80",
      "https://images.unsplash.com/photo-1574755393849-623942496936?w=600&q=80",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80"
    ],
    "sizes": [],
    "averageRating": 4.8,
    "reviewCount": 124
  },
  {
    "name": "Samsung Galaxy S24 Ultra",
    "description": "Samsung flagship with built-in S Pen, 200MP camera, and Snapdragon 8 Gen 3 processor. 6.8-inch Dynamic AMOLED display.",
    "price": 1199.99,
    "discount": 15,
    "stock": 18,
    "category": "phones",
    "images": [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80"
    ],
    "sizes": [],
    "averageRating": 4.7,
    "reviewCount": 89
  },
  {
    "name": "Google Pixel 8",
    "description": "Google Pixel 8 with Tensor G3 chip, advanced AI features, and 7 years of OS updates. Best-in-class computational photography.",
    "price": 699.99,
    "discount": 25,
    "stock": 29,
    "category": "phones",
    "images": [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
      "https://images.unsplash.com/photo-1574755393849-623942496936?w=600&q=80",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&q=80"
    ],
    "sizes": [],
    "averageRating": 4.5,
    "reviewCount": 67
  },
  {
    "name": "OnePlus 12",
    "description": "OnePlus 12 with Snapdragon 8 Gen 3, 100W fast charging, and Hasselblad camera tuning. 6.82-inch LTPO AMOLED display.",
    "price": 799.99,
    "discount": 0,
    "stock": 30,
    "category": "phones",
    "images": [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80",
      "https://images.unsplash.com/photo-1574755393849-623942496936?w=600&q=80"
    ],
    "sizes": [],
    "averageRating": 4.4,
    "reviewCount": 45
  },
  {
    "name": "MacBook Pro 14\"",
    "description": "Apple MacBook Pro with M3 Pro chip, 18GB unified memory, and 14-inch Liquid Retina XDR display. Up to 18 hours battery life.",
    "price": 1999.99,
    "discount": 0,
    "stock": 12,
    "category": "laptops",
    "images": [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
      "https://images.unsplash.com/photo-1611186871525-9c4f9b855c3e?w=600&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80"
    ],
    "sizes": [],
    "averageRating": 4.9,
    "reviewCount": 203
  },
  {
    "name": "Dell XPS 15",
    "description": "Dell XPS 15 with Intel Core i9, NVIDIA RTX 4070, and 15.6-inch OLED display. Premium build quality with InfinityEdge design.",
    "price": 1799.99,
    "discount": 0,
    "stock": 20,
    "category": "laptops",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778088765/products/xkcfponn1dke5yffuiv7.jpg"
    ],
    "sizes": [],
    "averageRating": 4.6,
    "reviewCount": 78
  },
  {
    "name": "Lenovo ThinkPad X1 Carbon",
    "description": "Business ultrabook with Intel Core i7, 16GB RAM, and legendary ThinkPad keyboard. Military-grade durability with 1.12kg weight.",
    "price": 1499.99,
    "discount": 0,
    "stock": 28,
    "category": "laptops",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778082796/products/txmqw84vwyrfqlbfhizq.jpg"
    ],
    "sizes": [],
    "averageRating": 4.7,
    "reviewCount": 156
  },
  {
    "name": "ASUS ROG Zephyrus G14",
    "description": "Gaming laptop with AMD Ryzen 9, RTX 4060, and 14-inch QHD 165Hz display. Compact powerhouse for gaming and content creation.",
    "price": 1399.99,
    "discount": 0,
    "stock": 30,
    "category": "laptops",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778094700/products/ofl23ccsbtqv7ogbagvn.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778094764/products/uyicjq76uftz8dw7irfi.jpg"
    ],
    "sizes": [],
    "averageRating": 4.5,
    "reviewCount": 92
  },
  {
    "name": "AirPods Pro (2nd Gen)",
    "description": "Apple AirPods Pro with Active Noise Cancellation, Adaptive Audio, and USB-C charging case. Up to 30 hours total listening time.",
    "price": 249.99,
    "discount": 30,
    "stock": 29,
    "category": "accessories",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778080133/products/fqqwse6664etd65h1d5x.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093852/products/rojfhg2spbmu6deln3kq.jpg"
    ],
    "sizes": [],
    "averageRating": 4.8,
    "reviewCount": 312
  },
  {
    "name": "G2000 Gaming Headset,",
    "description": "Industry-leading noise canceling headphones with 30-hour battery, multipoint connection, and crystal clear hands-free calling.",
    "price": 349.99,
    "discount": 10,
    "stock": 28,
    "category": "accessories",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778080738/products/cdwggxovl41njei0w88a.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778080905/products/nsvvgpoeart9aqgdo1ut.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778080972/products/bsmchqqg3ubtkw3qv3g8.jpg"
    ],
    "sizes": [],
    "averageRating": 4.9,
    "reviewCount": 445
  },
  {
    "name": "Apple Watch Series 9",
    "description": "Apple Watch Series 9 with S9 chip, Double Tap gesture, and Always-On Retina display. Advanced health sensors including blood oxygen.",
    "price": 399.99,
    "discount": 0,
    "stock": 30,
    "category": "accessories",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778094146/products/nkq0mryf09lchdptutqv.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778094225/products/y0zl2kefafgaavlt3dcu.jpg"
    ],
    "sizes": [],
    "averageRating": 4.7,
    "reviewCount": 189
  },
  {
    "name": "Anker 65W USB-C Charger",
    "description": "Compact 65W GaN charger with 3 ports (2x USB-C, 1x USB-A). Charges MacBook, iPhone, and iPad simultaneously.",
    "price": 45.99,
    "discount": 0,
    "stock": 30,
    "category": "accessories",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778094402/products/ydaupxg7bdnpl76kskm9.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778094492/products/j4fh1hl85a1o4xjagkx5.jpg"
    ],
    "sizes": [],
    "averageRating": 4.6,
    "reviewCount": 567
  },
  {
    "name": "Classic Oxford Shirt",
    "description": "Premium 100% cotton Oxford shirt with button-down collar. Available in multiple colors. Machine washable and wrinkle-resistant.",
    "price": 59.99,
    "discount": 0,
    "stock": 29,
    "category": "mens",
    "images": [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 4.3,
    "reviewCount": 234
  },
  {
    "name": "Slim Fit Chinos",
    "description": "Modern slim fit chino pants in stretch cotton blend. Versatile style for office or casual wear. Available in khaki, navy, and olive.",
    "price": 79.99,
    "discount": 0,
    "stock": 29,
    "category": "mens",
    "images": [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 4.4,
    "reviewCount": 178
  },
  {
    "name": "Merino Wool Sweater",
    "description": "Luxuriously soft merino wool crew neck sweater. Temperature-regulating and odor-resistant. Perfect for layering.",
    "price": 129.99,
    "discount": 0,
    "stock": 30,
    "category": "mens",
    "images": [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&q=80"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 4.6,
    "reviewCount": 89
  },
  {
    "name": "Floral Wrap Dress",
    "description": "Elegant wrap dress in lightweight chiffon with floral print. Adjustable tie waist and flutter sleeves. Perfect for any occasion.",
    "price": 89.99,
    "discount": 0,
    "stock": 30,
    "category": "womens",
    "images": [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 4.5,
    "reviewCount": 312
  },
  {
    "name": "High-Waist Yoga Pants",
    "description": "Four-way stretch yoga pants with moisture-wicking fabric and hidden waistband pocket. Squat-proof and ultra-comfortable.",
    "price": 69.99,
    "discount": 0,
    "stock": 30,
    "category": "womens",
    "images": [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 4.7,
    "reviewCount": 456
  },
  {
    "name": "Cashmere Turtleneck",
    "description": "Pure cashmere turtleneck sweater in a relaxed fit. Incredibly soft and warm. A wardrobe essential for cooler months.",
    "price": 199.99,
    "discount": 0,
    "stock": 30,
    "category": "womens",
    "images": [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 4.8,
    "reviewCount": 134
  },
  {
    "name": "Ergonomic Office Chair",
    "description": "Premium ergonomic chair with lumbar support, adjustable armrests, and breathable mesh back. Supports up to 300 lbs.",
    "price": 449.99,
    "discount": 0,
    "stock": 30,
    "category": "furniture",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778091032/products/hk9iyarwbdvrj7tkjosb.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778091067/products/e2sceiqm8uzbg7cyb7bd.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778091090/products/malinskkqbayvmozttan.jpg"
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 4.6,
    "reviewCount": 267
  },
  {
    "name": "Bedroom",
    "description": "Modern bedroom set designed for comfort and elegance, featuring a stylish bed, spacious wardrobe, and matching nightstands. Crafted from high-quality materials for durability and a cozy, refined look.",
    "price": 599.99,
    "discount": 0,
    "stock": 30,
    "category": "furniture",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093964/products/gbqscioioxuh1dci9oe7.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778094072/products/ntknx7dfortlbnto2uxk.jpg"
    ],
    "sizes": [],
    "averageRating": 4.7,
    "reviewCount": 189
  },
  {
    "name": "Black Dress",
    "description": "Chic black dress with a sleek fit and a stylish side slit. Ideal for evening events and parties.",
    "price": 300,
    "discount": 0,
    "stock": 44,
    "category": "womens",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093590/products/vgsthnmkqibwohinyflr.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093682/products/wvquvpmmltjtkip3zukx.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093785/products/wshbwlbklzexrp42ru1h.jpg"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 0,
    "reviewCount": 0
  },
  {
    "name": "White Dress",
    "description": "Elegant white dress with an off-shoulder design and a flattering fit. Perfect for weddings and formal occasions.",
    "price": 280,
    "discount": 0,
    "stock": 79,
    "category": "womens",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778241097/products/gjplcwnvronk0i3332hy.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778241128/products/ymyz2hwh5po7tiirdevk.jpg"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 0,
    "reviewCount": 0
  },
  {
    "name": "Black Pants",
    "description": "Classic black pants with a tailored fit and comfortable fabric. Designed for a clean, versatile look, perfect for both casual and formal wear.",
    "price": 152,
    "discount": 0,
    "stock": 79,
    "category": "womens",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093433/products/apjsbf9nvymuaczcfcto.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093476/products/kbnutvxvtumgftmdnlu8.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093501/products/obdbe2xdofcp3lsv5dkq.jpg"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 0,
    "reviewCount": 0
  },
  {
    "name": "Harris cashmere coat",
    "description": "Premium Harris cashmere coat crafted from luxurious, ultra-soft fabric. Designed with a refined, tailored fit for a timeless and sophisticated look, perfect for cold-weather elegance.",
    "price": 240,
    "discount": 0,
    "stock": 40,
    "category": "womens",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093327/products/hms3r54nmsn6ellffftr.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093353/products/f9jbbikl366wz6eao9bo.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778093391/products/ojcnqclzusnls84l5xih.jpg"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 0,
    "reviewCount": 0
  },
  {
    "name": "Purble Dress",
    "description": "Elegant Purple evening dress crafted from premium satin fabric, featuring a flattering off-shoulder neckline that highlights the shoulders beautifully. Designed with a fitted bodice that enhances the silhouette, flowing into a sleek, floor-length skirt for a graceful and timeless look. Perfect for weddings, formal events, and special occasions.",
    "price": 275,
    "discount": 0,
    "stock": 79,
    "category": "womens",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778089061/products/eswfkkrkj6dvupcoiec2.jpg"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 5,
    "reviewCount": 1
  },
  {
    "name": "Classic",
    "description": "\"A sharp, three-piece tailored suit in premium charcoal wool for a timeless, executive look.\"",
    "price": 750,
    "discount": 0,
    "stock": 81,
    "category": "mens",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778241428/products/a5thxegwktwhc1lu5abp.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778241478/products/inesuno4onoorza8wdry.jpg"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 5,
    "reviewCount": 1
  },
  {
    "name": "Classic 2",
    "description": "\"Modern slim-fit suit paired with handcrafted Oxford shoes for a commanding, professional presence.\"",
    "price": 460,
    "discount": 0,
    "stock": 89,
    "category": "mens",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778241661/products/kfhve9bp4gdstfhqejn6.jpg",
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778241700/products/q8jv5htztiqfzgjmxxio.jpg"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    "averageRating": 0,
    "reviewCount": 0
  },
  {
    "name": "BedRoom",
    "description": "Comfortable",
    "price": 2000,
    "discount": 0,
    "stock": 86,
    "category": "furniture",
    "images": [
      "https://res.cloudinary.com/dr9hdwmnh/image/upload/v1778456850/products/evqltl6bgerorr8a6fdq.jpg"
    ],
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "averageRating": 5,
    "reviewCount": 1
  }
];
export const SHIPPING_ZONES: ShippingZoneSeed[] = [];
export const SHIPPING_RATES: ShippingRateSeed[] = [];
