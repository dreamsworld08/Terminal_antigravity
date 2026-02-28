import { prisma } from "@/lib/db";

const products = [
    {
        name: "Noir Lounge Sofa",
        slug: "noir-lounge-sofa",
        description: "A statement piece in deep charcoal velvet. Low-profile design with solid walnut legs and hand-stitched detailing. Seats three comfortably.",
        price: 349000,
        category: "living",
        material: "Velvet",
        color: "Charcoal",
        dimensions: "240 × 95 × 75 cm",
        image: "/images/products/product-1555041469-a586c61ea9bc.jpg",
        images: JSON.stringify([
            { name: "Charcoal", hex: "#36454F", image: "/images/products/product-1555041469-a586c61ea9bc.jpg" },
            { name: "Midnight Blue", hex: "#191970", image: "/images/products/product-1540574163026-643ea20ade25.jpg" },
            { name: "Emerald", hex: "#2E5D4B", image: "/images/products/product-1493663284031-b7e3aefcae8e.jpg" },
            { name: "Blush", hex: "#D4A5A5", image: "/images/products/product-1550581190-9c1c48d21d6c.jpg" }
        ]),
        featured: true,
    },
    {
        name: "Terra Coffee Table",
        slug: "terra-coffee-table",
        description: "Sculptural coffee table in natural travertine stone with a brushed brass base. Each piece is unique due to natural stone variations.",
        price: 235000,
        category: "living",
        material: "Travertine",
        color: "Natural Stone",
        dimensions: "120 × 60 × 40 cm",
        image: "/images/products/product-1634712282287-14ed57b9cc89.jpg",
        images: JSON.stringify([
            { name: "Natural Stone", hex: "#C4B49A", image: "/images/products/product-1634712282287-14ed57b9cc89.jpg" },
            { name: "Honed White", hex: "#E8E0D4", image: "/images/products/product-1533090481720-856c6e3c1fdc.jpg" },
            { name: "Fossil Grey", hex: "#8E8E8E", image: "/images/products/product-1611967164521-abae8fba4668.jpg" }
        ]),
        featured: true,
    },
    {
        name: "Crescent Accent Chair",
        slug: "crescent-accent-chair",
        description: "Curved back accent chair upholstered in Italian bouclé fabric. A perfect blend of mid-century form and modern comfort.",
        price: 154000,
        category: "living",
        material: "Bouclé",
        color: "Cream",
        dimensions: "78 × 72 × 82 cm",
        image: "/images/products/product-1598300042247-d088f8ab3a91.jpg",
        images: JSON.stringify([
            { name: "Cream", hex: "#FFFDD0", image: "/images/products/product-1598300042247-d088f8ab3a91.jpg" },
            { name: "Oat", hex: "#D4C5A9", image: "/images/products/product-1567538096630-e0c55bd6374c.jpg" },
            { name: "Sand", hex: "#C2B280", image: "/images/products/product-1586023492125-27b2c045efd7.jpg" },
            { name: "Charcoal", hex: "#36454F", image: "/images/products/product-1519947486511-46149fa0a254.jpg" }
        ]),
        featured: true,
    },
    {
        name: "Haven Platform Bed",
        slug: "haven-platform-bed",
        description: "Floating platform bed in solid white oak. Minimal design with integrated LED ambient lighting and leather-wrapped headboard.",
        price: 465000,
        category: "bedroom",
        material: "White Oak",
        color: "Natural Oak",
        dimensions: "220 × 200 × 90 cm",
        image: "/images/products/product-1616594039964-ae9021a400a0.jpg",
        images: JSON.stringify([
            { name: "Natural Oak", hex: "#C4A35A", image: "/images/products/product-1616594039964-ae9021a400a0.jpg" },
            { name: "Bleached", hex: "#E8DCC8", image: "/images/products/product-1505693416388-ac5ce068fe85.jpg" },
            { name: "Smoked", hex: "#5C4033", image: "/images/products/product-1588046130717-0eb0c9a3ba15.jpg" },
            { name: "Ebony", hex: "#2C2418", image: "/images/products/product-1615874959474-d609969a20ed.jpg" }
        ]),
        featured: false,
    },
    {
        name: "Dusk Nightstand",
        slug: "dusk-nightstand",
        description: "Sculptural nightstand with a single brushed drawer and open shelf. Blackened steel frame with solid walnut surfaces.",
        price: 82000,
        category: "bedroom",
        material: "Walnut",
        color: "Dark Walnut",
        dimensions: "50 × 40 × 55 cm",
        image: "/images/products/product-1532372576444-dda954194ad0.jpg",
        images: JSON.stringify([
            { name: "Dark Walnut", hex: "#5C4033", image: "/images/products/product-1532372576444-dda954194ad0.jpg" },
            { name: "Natural Walnut", hex: "#7A5C40", image: "/images/products/product-1556228453-efd6c1ff04f6.jpg" },
            { name: "Honey", hex: "#B8860B", image: "/images/products/product-1595428774223-ef52624120d2.jpg" },
            { name: "Ebonized", hex: "#1C1108", image: "/images/products/product-1611967164521-abae8fba4668.jpg" }
        ]),
        featured: false,
    },
    {
        name: "Silhouette Dresser",
        slug: "silhouette-dresser",
        description: "Six-drawer dresser in matte lacquered maple with soft-close drawers and hand-cast bronze pulls. Designed for serene organization.",
        price: 285000,
        category: "bedroom",
        material: "Maple",
        color: "Matte White",
        dimensions: "160 × 50 × 85 cm",
        image: "/images/products/product-1595428774223-ef52624120d2.jpg",
        images: JSON.stringify([
            { name: "Matte White", hex: "#F0EDE5", image: "/images/products/product-1595428774223-ef52624120d2.jpg" },
            { name: "Natural Maple", hex: "#C9B583", image: "/images/products/product-1558997519-83ea9252edf8.jpg" },
            { name: "Grey Wash", hex: "#A3A3A3", image: "/images/products/product-1556228453-efd6c1ff04f6.jpg" },
            { name: "Espresso", hex: "#3C280D", image: "/images/products/product-1551298370-9d3d53740c72.jpg" }
        ]),
        featured: false,
    },
    {
        name: "Monolith Dining Table",
        slug: "monolith-dining-table",
        description: "A commanding dining table carved from a single slab of live-edge walnut. Seats eight. Base in blackened steel with geometric form.",
        price: 599000,
        category: "dining",
        material: "Walnut",
        color: "Natural Walnut",
        dimensions: "260 × 100 × 76 cm",
        image: "/images/products/product-1617806118233-18e1de247200.jpg",
        images: JSON.stringify([
            { name: "Natural Walnut", hex: "#7A5C40", image: "/images/products/product-1617806118233-18e1de247200.jpg" },
            { name: "Dark Walnut", hex: "#5C4033", image: "/images/products/product-1604578762246-41134e37f9cc.jpg" },
            { name: "Honey", hex: "#B8860B", image: "/images/products/product-1615066390971-03e4e1c36ddf.jpg" },
            { name: "Ebonized", hex: "#1C1108", image: "https://images.unsplash.com/photo-1595514535711-1e61e4b20a2a?w=800&q=80" }
        ]),
        featured: true,
    },
    {
        name: "Arc Dining Chair",
        slug: "arc-dining-chair",
        description: "Sculptural dining chair with a steam-bent ash frame and full-grain leather seat. Ergonomic design meets visual lightness.",
        price: 74000,
        category: "dining",
        material: "Ash Wood",
        color: "Natural Ash",
        dimensions: "50 × 55 × 80 cm",
        image: "/images/products/product-1503602642458-232111445657.jpg",
        images: JSON.stringify([
            { name: "Natural Ash", hex: "#C9B68E", image: "/images/products/product-1503602642458-232111445657.jpg" },
            { name: "White Wash", hex: "#E8DCC8", image: "/images/products/product-1581539250439-c96689b516dd.jpg" },
            { name: "Smoke", hex: "#6B6B6B", image: "/images/products/product-1592078615290-033ee584e267.jpg" },
            { name: "Ebony", hex: "#2C2418", image: "/images/products/product-1519947486511-46149fa0a254.jpg" }
        ]),
        featured: false,
    },
    {
        name: "Axis Executive Desk",
        slug: "axis-executive-desk",
        description: "Expansive executive desk with cable management, integrated wireless charging, and a floating drawer unit. Solid oak top on a steel frame.",
        price: 399000,
        category: "office",
        material: "Oak",
        color: "Smoked Oak",
        dimensions: "180 × 80 × 76 cm",
        image: "/images/products/product-1518455027359-f3f8164ba6bd.jpg",
        images: JSON.stringify([
            { name: "Smoked Oak", hex: "#5C4033", image: "/images/products/product-1518455027359-f3f8164ba6bd.jpg" },
            { name: "Natural Oak", hex: "#C4A35A", image: "/images/products/product-1611269154421-4e27233ac5c7.jpg" },
            { name: "Cerused", hex: "#D2C4A8", image: "/images/products/product-1593062096033-9a26b09da705.jpg" },
            { name: "Charcoal", hex: "#333333", image: "/images/products/product-1519219788971-8d9797e0928e.jpg" }
        ]),
        featured: true,
    },
    {
        name: "Pivot Office Chair",
        slug: "pivot-office-chair",
        description: "High-performance task chair with Italian leather upholstery, adjustable lumbar support, and a die-cast aluminum base.",
        price: 183000,
        category: "office",
        material: "Leather",
        color: "Cognac",
        dimensions: "68 × 68 × 120 cm",
        image: "/images/products/product-1580480055273-228ff5388ef8.jpg",
        images: JSON.stringify([
            { name: "Cognac", hex: "#9A4E1C", image: "/images/products/product-1580480055273-228ff5388ef8.jpg" },
            { name: "Black", hex: "#1C1C1C", image: "/images/products/product-1598300042247-d088f8ab3a91.jpg" },
            { name: "Tan", hex: "#C19A6B", image: "/images/products/product-1506439773649-6e0eb8cfb237.jpg" },
            { name: "Navy", hex: "#1B2A4A", image: "/images/products/product-1519947486511-46149fa0a254.jpg" }
        ]),
        featured: false,
    },
    {
        name: "Vault Bookshelf",
        slug: "vault-bookshelf",
        description: "Modular shelving system in blackened steel and natural oak. Asymmetric design allows creative configurations. Wall-mounted.",
        price: 259000,
        category: "living",
        material: "Steel & Oak",
        color: "Black & Oak",
        dimensions: "200 × 35 × 220 cm",
        image: "/images/products/product-1594620302200-9a762244a156.jpg",
        images: JSON.stringify([
            { name: "Black & Oak", hex: "#333333", image: "/images/products/product-1594620302200-9a762244a156.jpg" },
            { name: "Bronze & Oak", hex: "#8C6D46", image: "/images/products/product-1507003211169-0a1dd7228f2d.jpg" },
            { name: "White & Oak", hex: "#E8E0D4", image: "/images/products/product-1600585152220-90363fe7e115.jpg" }
        ]),
        featured: false,
    },
    {
        name: "Echo Console Table",
        slug: "echo-console-table",
        description: "Slim console table in polished concrete with bronze-finished legs. Perfect for entryways, hallways, or behind a sofa.",
        price: 133000,
        category: "living",
        material: "Concrete",
        color: "Gray",
        dimensions: "140 × 35 × 80 cm",
        image: "/images/products/product-1611967164521-abae8fba4668.jpg",
        images: JSON.stringify([
            { name: "Gray", hex: "#808080", image: "/images/products/product-1611967164521-abae8fba4668.jpg" },
            { name: "Light", hex: "#B8B8B8", image: "/images/products/product-1533090481720-856c6e3c1fdc.jpg" },
            { name: "Dark", hex: "#4A4A4A", image: "/images/products/product-1551298370-9d3d53740c72.jpg" },
            { name: "Warm", hex: "#A39382", image: "/images/products/product-1556228453-efd6c1ff04f6.jpg" }
        ]),
        featured: false,
    },
];

async function seed() {
    console.log("🌱 Seeding database...");

    // Clear existing
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.savedDesign.deleteMany();
    await prisma.customRequest.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 12);

    await prisma.user.create({
        data: {
            name: "Admin",
            email: "admin@terminal.co",
            hashedPassword,
            role: "admin",
        },
    });

    // Create demo customer
    const customerPassword = await bcrypt.hash("customer123", 12);
    await prisma.user.create({
        data: {
            name: "Alex Morgan",
            email: "alex@example.com",
            hashedPassword: customerPassword,
            role: "customer",
        },
    });

    // Create products
    for (const product of products) {
        await prisma.product.create({ data: product });
    }

    console.log("✅ Database seeded successfully!");
    console.log("   Admin: admin@terminal.co / admin123");
    console.log("   Customer: alex@example.com / customer123");
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
