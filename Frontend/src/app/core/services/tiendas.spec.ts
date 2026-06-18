import { TestBed } from '@angular/core/testing';

import { Tiendas } from './tiendas';

describe('Tiendas', () => {
  let service: Tiendas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tiendas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
