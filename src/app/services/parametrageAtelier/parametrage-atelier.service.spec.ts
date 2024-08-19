import { TestBed } from '@angular/core/testing';

import { ParametrageAtelierService } from './parametrage-atelier.service';

describe('ParametrageAtelierService', () => {
  let service: ParametrageAtelierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParametrageAtelierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
