import { TestBed } from '@angular/core/testing';

import { PerformanceAtelierService } from './performance-atelier.service';

describe('PerformanceAtelierService', () => {
  let service: PerformanceAtelierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformanceAtelierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
