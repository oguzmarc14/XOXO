import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CerrarTurno } from './cerrar-turno';

describe('CerrarTurno', () => {
  let component: CerrarTurno;
  let fixture: ComponentFixture<CerrarTurno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CerrarTurno],
    }).compileComponents();

    fixture = TestBed.createComponent(CerrarTurno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
