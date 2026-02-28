const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Updating product...");
        const product = await prisma.product.update({
            where: { slug: "echo-console-table" },
            data: { modelUrl: "https://terminal-obj.s3.eu-north-1.amazonaws.com/base.obj" }
        });
        console.log("Success:", product.modelUrl);
    } catch (e) {
        console.error("Prisma Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
