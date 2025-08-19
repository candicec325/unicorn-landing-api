import {betterAuth} from 'better-auth';
import {prismaAdapter} from 'better-auth/adapters/prisma';
import {PrismaClient} from '@prisma/client';
import {admin, username} from 'better-auth/plugins';

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async () => {
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        expiresIn: 1000 * 60 * 60 * 24, // 1 day
        sendVerificationEmail: async ({user, url, token}, request) => {
        }
    },
    plugins: [
        (admin as any)({
            adminRoles: ['admin', 'superadmin'],
        }),
        username({
            displayUsernameValidator: (displayUsername) => {
                // Allow only alphanumeric characters, underscores, and hyphens
                return /^[a-zA-Z0-9_-]+$/.test(displayUsername);
            },
            usernameValidator: (username) => {
                if (username === 'admin') {
                    return false;
                }
                return true;
            },
            maxUsernameLength: 30,
            minUsernameLength: 5,
        }),
    ],
});
