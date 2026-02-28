const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const pd = await prisma.product.findFirst({ where: { slug: "dusk-nightstand" } });
        console.log("Existing product:", pd);

        if (!pd) return;

        // Try updating it exactly as the frontend would:
        const productData = {
            name: pd.name,
            slug: pd.slug,
            description: pd.description,
            price: Number(pd.price),
            category: pd.category,
            material: pd.material,
            color: "Cognac",
            dimensions: pd.dimensions,
            image: pd.image,
            images: JSON.stringify([
                { name: "Cognac", hex: "#9A4E1C", image: "https://images.unsplash.com/photo-1" },
                { name: "Black", hex: "#1c1c1c", image: "https://images.unsplash.com/photo-2" }
            ]),
            modelUrl: pd.modelUrl || null,
            inStock: pd.inStock,
            featured: pd.featured,
        };

        const res = await prisma.product.update({
            where: { slug: pd.slug },
            data: productData,
        });

        console.log("Updated successfully:", res);
    } catch (e) {
        console.error("Failed to update:", e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
