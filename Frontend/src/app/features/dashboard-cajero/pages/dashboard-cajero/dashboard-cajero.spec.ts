import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCajero } from './dashboard-cajero';

describe('DashboardCajero', () => {
  let component: DashboardCajero;
  let fixture: ComponentFixture<DashboardCajero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCajero],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardCajero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
