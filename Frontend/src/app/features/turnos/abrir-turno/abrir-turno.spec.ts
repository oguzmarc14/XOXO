import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbrirTurno } from './abrir-turno';

describe('AbrirTurno', () => {
  let component: AbrirTurno;
  let fixture: ComponentFixture<AbrirTurno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbrirTurno],
    }).compileComponents();

    fixture = TestBed.createComponent(AbrirTurno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
