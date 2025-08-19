import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ClubsService } from './clubs.service';

@Controller('clubs')
export class ClubsController {
  constructor(private clubsService: ClubsService) {}
  @Get()
  async findAll() {}

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('includeReviews') includeReviews: string,
  ) {
    if (includeReviews) {
      // return query that joins reviews on club details
    }
    // return just the club details
  }

  @Post(':id/review')
  async addReview(
    @Param('id') id: string,
    @Body() data: Record<string, string>, // change to Club Update type
  ) {}
}
