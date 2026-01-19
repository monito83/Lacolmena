
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Testing Prisma Connection...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')); // Mask password

    try {
        await prisma.$connect();
        console.log('✅ Prisma connected successfully!');

        const count = await prisma.user.count();
        console.log(`✅ Database query successful. User count: ${count}`);

        await prisma.$disconnect();
    } catch (e) {
        console.error('❌ Prisma Connection Failed:', e);
        process.exit(1);
    }
}

main();
