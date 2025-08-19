"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthEmailHook = void 0;
const common_1 = require("@nestjs/common");
const nestjs_better_auth_1 = require("@thallesp/nestjs-better-auth");
const email_service_1 = require("../email/email.service");
let AuthEmailHook = class AuthEmailHook {
    emailService;
    constructor(emailService) {
        this.emailService = emailService;
    }
    async handleSignInEmail(ctx) {
        console.log('Email sign-in hook triggered:', ctx);
    }
    async handlePasswordReset(ctx) {
        console.log('Password reset hook triggered:', ctx);
        const { user, url, token } = ctx.body || ctx.context || ctx;
        if (user && user.email) {
            await this.emailService.sendPasswordResetEmail({
                to: user.email,
                resetLink: url,
                token,
            });
        }
    }
    async handleEmailVerification(ctx) {
        console.log('Email verification hook triggered:', ctx);
        const { user, url, token } = ctx.body || ctx.context || ctx;
        if (user && user.email) {
            await this.emailService.sendVerificationEmail({
                to: user.email,
                verificationUrl: url,
                token,
            });
        }
    }
    async handlePasswordResetRequest(ctx) {
        console.log('Password reset request hook triggered:', ctx);
    }
};
exports.AuthEmailHook = AuthEmailHook;
__decorate([
    (0, nestjs_better_auth_1.AfterHook)('/sign-in/email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthEmailHook.prototype, "handleSignInEmail", null);
__decorate([
    (0, nestjs_better_auth_1.AfterHook)('/forget-password'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthEmailHook.prototype, "handlePasswordReset", null);
__decorate([
    (0, nestjs_better_auth_1.AfterHook)('/send-verification-email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthEmailHook.prototype, "handleEmailVerification", null);
__decorate([
    (0, nestjs_better_auth_1.AfterHook)('/request-password-reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthEmailHook.prototype, "handlePasswordResetRequest", null);
exports.AuthEmailHook = AuthEmailHook = __decorate([
    (0, nestjs_better_auth_1.Hook)(),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], AuthEmailHook);
//# sourceMappingURL=auth-email.hook.js.map