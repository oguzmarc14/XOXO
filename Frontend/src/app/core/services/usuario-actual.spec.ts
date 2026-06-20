import { TestBed } from '@angular/core/testing';

import { UsuarioActual } from './usuario-actual';

describe('UsuarioActual', () => {
  let service: UsuarioActual;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioActual);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
