const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@terminal.com';
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.iMSUser.upsert({
        where: { email },
        update: {
            hashedPassword: hashedPassword,
            role: 'superadmin',
            isActive: true,
        },
        create: {
            name: 'Terminal Admin',
            email: email,
            hashedPassword: hashedPassword,
            role: 'superadmin',
            isActive: true,
        },
    });

    console.log('IMS Admin created:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
