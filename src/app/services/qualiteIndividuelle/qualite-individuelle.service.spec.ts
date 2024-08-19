import { TestBed } from '@angular/core/testing';

import { QualiteIndividuelleService } from './qualite-individuelle.service';

describe('QualiteIndividuelleService', () => {
  let service: QualiteIndividuelleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QualiteIndividuelleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
