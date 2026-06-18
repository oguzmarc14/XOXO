import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajeroLayout } from './cajero-layout';

describe('CajeroLayout', () => {
  let component: CajeroLayout;
  let fixture: ComponentFixture<CajeroLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajeroLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(CajeroLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
