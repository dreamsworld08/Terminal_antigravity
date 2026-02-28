const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log(await prisma.product.findFirst({where: {slug: "dusk-nightstand"}}));    
}
main().finally(() => prisma.$disconnect());
