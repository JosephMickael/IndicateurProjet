import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceIndividuelleComponent } from './performance-individuelle.component';

describe('PerformanceIndividuelleComponent', () => {
  let component: PerformanceIndividuelleComponent;
  let fixture: ComponentFixture<PerformanceIndividuelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformanceIndividuelleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceIndividuelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
