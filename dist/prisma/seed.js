"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto_1 = require("better-auth/crypto");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seed...');
    const adminPassword = await (0, crypto_1.hashPassword)('admin123');
    const userPassword = await (0, crypto_1.hashPassword)('user123');
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@example.com' },
        update: {},
        create: {
            id: 'superadmin-' + Date.now(),
            name: 'Super Admin',
            email: 'superadmin@example.com',
            emailVerified: true,
            role: 'superadmin',
            createdAt: new Date(),
            updatedAt: new Date(),
            username: 'superadminUser',
        },
    });
    const existingSuperadminAccount = await prisma.account.findFirst({
        where: {
            id: superAdmin.id,
            providerId: 'credential',
        },
    });
    if (!existingSuperadminAccount) {
        await prisma.account.create({
            data: {
                id: 'superadmin-account-' + Date.now(),
                accountId: superAdmin.email,
                providerId: 'credential',
                userId: superAdmin.id,
                password: adminPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            id: 'admin-' + Date.now(),
            name: 'Admin User',
            email: 'admin@example.com',
            emailVerified: true,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date(),
            username: 'adminUser',
        },
    });
    const existingAdminAccount = await prisma.account.findFirst({
        where: {
            userId: admin.id,
            providerId: 'credential',
        },
    });
    if (!existingAdminAccount) {
        await prisma.account.create({
            data: {
                id: 'admin-account-' + Date.now(),
                accountId: admin.email,
                providerId: 'credential',
                userId: admin.id,
                password: adminPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            id: 'user-' + Date.now(),
            name: 'Regular User',
            email: 'user@example.com',
            emailVerified: true,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
            username: 'basicUser',
        },
    });
    const existingUserAccount = await prisma.account.findFirst({
        where: {
            userId: user.id,
            providerId: 'credential',
        },
    });
    if (!existingUserAccount) {
        await prisma.account.create({
            data: {
                id: 'user-account-' + Date.now(),
                accountId: user.email,
                providerId: 'credential',
                userId: user.id,
                password: userPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    console.log('✅ Created superadmin user:', {
        email: superAdmin.email,
        role: superAdmin.role,
    });
    console.log('✅ Created admin user:', {
        email: admin.email,
        role: admin.role,
    });
    console.log('✅ Created regular user:', {
        email: user.email,
        role: user.role,
    });
    console.log('✅ Superadmin password: admin123');
    console.log('✅ Admin password: admin123');
    console.log('✅ User password: user123');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map