"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const client_1 = require("@prisma/client");
const plugins_1 = require("better-auth/plugins");
const prisma = new client_1.PrismaClient();
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_1.prismaAdapter)(prisma, {
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
        expiresIn: 1000 * 60 * 60 * 24,
        sendVerificationEmail: async ({ user, url, token }, request) => {
        }
    },
    plugins: [
        plugins_1.admin({
            adminRoles: ['admin', 'superadmin'],
        }),
        (0, plugins_1.username)({
            displayUsernameValidator: (displayUsername) => {
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
//# sourceMappingURL=auth.js.map