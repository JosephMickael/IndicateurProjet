import { TestBed } from '@angular/core/testing';

import { PerformanceIndividuelleService } from './performance-individuelle.service';

describe('PerformanceIndividuelleService', () => {
  let service: PerformanceIndividuelleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformanceIndividuelleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
