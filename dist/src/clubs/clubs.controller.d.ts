import { ClubsService } from './clubs.service';
export declare class ClubsController {
    private clubsService;
    constructor(clubsService: ClubsService);
    findAll(): Promise<void>;
    findOne(id: string, includeReviews: string): Promise<void>;
    addReview(id: string, data: Record<string, string>): Promise<void>;
}
//# sourceMappingURL=clubs.controller.d.ts.map