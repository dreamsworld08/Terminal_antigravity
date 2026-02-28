import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Seeding IMS data...");

    // 1. Create Superadmin User
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    const superadmin = await prisma.iMSUser.upsert({
        where: { email: "admin@terminal.com" },
        update: {},
        create: {
            name: "Super Admin",
            email: "admin@terminal.com",
            hashedPassword,
            role: "superadmin",
        },
    });
    console.log("✅ Superadmin created:", superadmin.email);

    // 2. Create Suppliers
    const suppliers = await Promise.all([
        prisma.supplier.create({
            data: {
                name: "Royal Oak Timber Co.",
                email: "orders@royaloaktimber.com",
                phone: "+91-9876543210",
                address: "Industrial Area, Jodhpur, Rajasthan",
                contactPerson: "Rajesh Kumar",
                leadTimeDays: 7,
                rating: 4.5,
            },
        }),
        prisma.supplier.create({
            data: {
                name: "FabricWorld India",
                email: "supply@fabricworld.in",
                phone: "+91-8765432109",
                address: "Textile Hub, Surat, Gujarat",
                contactPerson: "Anita Patel",
                leadTimeDays: 5,
                rating: 4.2,
            },
        }),
        prisma.supplier.create({
            data: {
                name: "MetalCraft Solutions",
                email: "bulk@metalcraft.co.in",
                phone: "+91-7654321098",
                address: "MIDC, Pune, Maharashtra",
                contactPerson: "Suresh Menon",
                leadTimeDays: 10,
                rating: 4.0,
            },
        }),
    ]);
    console.log("✅ Created", suppliers.length, "suppliers");

    // 3. Create Inventory for existing products
    const products = await prisma.product.findMany();
    const inventoryData = products.map((product, index) => ({
        productId: product.id,
        sku: `TRM-${product.category.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(4, "0")}`,
        quantity: Math.floor(Math.random() * 50) + 5,
        reservedQty: Math.floor(Math.random() * 5),
        reorderPoint: 5,
        reorderQty: 15,
        unitCost: product.price * 0.6,
        location: ["Warehouse A", "Warehouse B", "Showroom Floor"][index % 3],
    }));

    for (const inv of inventoryData) {
        await prisma.inventory.upsert({
            where: { productId: inv.productId },
            update: {},
            create: inv,
        });
    }
    console.log("✅ Created inventory for", products.length, "products");

    // 4. Create sample stock movements
    const inventories = await prisma.inventory.findMany();
    for (const inv of inventories.slice(0, 5)) {
        await prisma.stockMovement.create({
            data: {
                inventoryId: inv.id,
                type: "in",
                quantity: 20,
                reason: "Initial stock",
                reference: "INIT-001",
            },
        });
        await prisma.stockMovement.create({
            data: {
                inventoryId: inv.id,
                type: "out",
                quantity: Math.floor(Math.random() * 10) + 1,
                reason: "Customer order",
                reference: "ORD-" + Math.floor(Math.random() * 1000),
            },
        });
    }
    console.log("✅ Created sample stock movements");

    // 5. Create Reorder Rules
    await prisma.reorderRule.createMany({
        data: [
            { name: "Default Rule", minStockLevel: 5, reorderQuantity: 15, maxStockLevel: 100, autoReorder: true },
            { name: "Sofa & Seating", category: "sofa", minStockLevel: 3, reorderQuantity: 10, maxStockLevel: 50, autoReorder: true },
            { name: "Tables", category: "table", minStockLevel: 5, reorderQuantity: 20, maxStockLevel: 80, autoReorder: true },
            { name: "Beds & Bedroom", category: "bed", minStockLevel: 2, reorderQuantity: 8, maxStockLevel: 30, autoReorder: true },
        ],
    });
    console.log("✅ Created reorder rules");

    // 6. Create sample alerts for low-stock items
    const lowStockItems = inventories.filter((i) => i.quantity <= i.reorderPoint);
    for (const item of lowStockItems) {
        await prisma.stockAlert.create({
            data: {
                inventoryId: item.id,
                type: "low_stock",
                message: `Stock for SKU ${item.sku} is below reorder point (${item.quantity}/${item.reorderPoint})`,
                severity: item.quantity === 0 ? "critical" : "warning",
            },
        });
    }
    console.log("✅ Created", lowStockItems.length, "stock alerts");

    console.log("\n🎉 IMS seed complete!");
    console.log("📧 Superadmin login: admin@terminal.com / Admin@123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
