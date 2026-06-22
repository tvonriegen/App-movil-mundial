import { TestBed } from '@angular/core/testing';

import { Predicciones } from './predicciones';

describe('Predicciones', () => {
  let service: Predicciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Predicciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
