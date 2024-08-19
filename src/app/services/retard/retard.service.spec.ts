import { TestBed } from '@angular/core/testing';

import { RetardService } from './retard.service';

describe('RetardService', () => {
  let service: RetardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
