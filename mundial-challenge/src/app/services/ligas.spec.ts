import { TestBed } from '@angular/core/testing';

import { Ligas } from './ligas';

describe('Ligas', () => {
  let service: Ligas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ligas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
