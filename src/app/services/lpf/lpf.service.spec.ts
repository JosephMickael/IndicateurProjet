import { TestBed } from '@angular/core/testing';

import { LPFService } from './lpf.service';

describe('LPFService', () => {
  let service: LPFService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LPFService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
