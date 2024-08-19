import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceAtelierComponent } from './performance-atelier.component';

describe('PerformanceAtelierComponent', () => {
  let component: PerformanceAtelierComponent;
  let fixture: ComponentFixture<PerformanceAtelierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PerformanceAtelierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceAtelierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
