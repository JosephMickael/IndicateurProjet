import { TestBed } from '@angular/core/testing';

import { QualiteProjetService } from './qualite-projet.service';

describe('QualiteProjetService', () => {
  let service: QualiteProjetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QualiteProjetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
