"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("./auth");
const app_service_1 = require("./app.service");
const app_controller_1 = require("./app.controller");
const nestjs_better_auth_1 = require("@thallesp/nestjs-better-auth");
const auth_email_hook_1 = require("./auth/auth-email.hook");
const events_module_1 = require("./events/events.module");
const events_controller_1 = require("./events/events.controller");
const clubs_service_1 = require("./clubs/clubs.service");
const clubs_module_1 = require("./clubs/clubs.module");
const clubs_controller_1 = require("./clubs/clubs.controller");
const email_module_1 = require("./email/email.module");
const email_controller_1 = require("./email/email.controller");
const email_service_1 = require("./email/email.service");
const media_module_1 = require("./media/media.module");
const media_controller_1 = require("./media/media.controller");
const media_service_1 = require("./media/media.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_better_auth_1.AuthModule.forRoot(auth_1.auth),
            media_module_1.MediaModule,
            events_module_1.EventsModule,
            clubs_module_1.ClubsModule,
            email_module_1.EmailModule,
        ],
        controllers: [
            app_controller_1.AppController,
            events_controller_1.EventsController,
            email_controller_1.EmailController,
            clubs_controller_1.ClubsController,
            media_controller_1.MediaController
        ],
        providers: [
            app_service_1.AppService,
            clubs_service_1.ClubsService,
            auth_email_hook_1.AuthEmailHook,
            email_service_1.EmailService,
            media_service_1.MediaService
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map