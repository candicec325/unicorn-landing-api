import { Test, TestingModule } from '@nestjs/testing';
import { ClubsService } from './clubs.service';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('ClubsService', () => {
  let service: ClubsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClubsService],
    }).compile();

    service = module.get<ClubsService>(ClubsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
