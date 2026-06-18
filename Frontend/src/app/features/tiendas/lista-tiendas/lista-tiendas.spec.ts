import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaTiendas } from './lista-tiendas';

describe('ListaTiendas', () => {
  let component: ListaTiendas;
  let fixture: ComponentFixture<ListaTiendas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaTiendas],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaTiendas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
