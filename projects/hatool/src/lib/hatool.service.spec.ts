import { TestBed } from '@angular/core/testing';

import { HatoolService } from './hatool.service';

describe('HatoolService', () => {
  let service: HatoolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HatoolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
