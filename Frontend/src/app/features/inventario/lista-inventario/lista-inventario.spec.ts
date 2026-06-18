import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaInventario } from './lista-inventario';

describe('ListaInventario', () => {
  let component: ListaInventario;
  let fixture: ComponentFixture<ListaInventario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaInventario],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaInventario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
