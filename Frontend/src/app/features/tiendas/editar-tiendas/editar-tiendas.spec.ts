import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTienda } from './editar-tiendas';

describe('EditarTienda', () => {
  let component: EditarTienda;
  let fixture: ComponentFixture<EditarTienda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarTienda],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarTienda);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
