import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardResumen } from './card-resumen';

describe('CardResumen', () => {
  let component: CardResumen;
  let fixture: ComponentFixture<CardResumen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardResumen],
    }).compileComponents();

    fixture = TestBed.createComponent(CardResumen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
