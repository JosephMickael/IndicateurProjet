import { TestBed } from '@angular/core/testing';

import { RetourClientService } from './retour-client.service';

describe('RetourClientService', () => {
  let service: RetourClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetourClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
