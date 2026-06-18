import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimientosInventario } from './movimientos-inventario';

describe('MovimientosInventario', () => {
  let component: MovimientosInventario;
  let fixture: ComponentFixture<MovimientosInventario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimientosInventario],
    }).compileComponents();

    fixture = TestBed.createComponent(MovimientosInventario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
