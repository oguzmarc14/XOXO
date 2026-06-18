import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTienda } from './crear-tienda';

describe('CrearTienda', () => {
  let component: CrearTienda;
  let fixture: ComponentFixture<CrearTienda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTienda],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearTienda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
