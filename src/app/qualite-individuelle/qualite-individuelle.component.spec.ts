import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualiteIndividuelleComponent } from './qualite-individuelle.component';

describe('QualiteIndividuelleComponent', () => {
  let component: QualiteIndividuelleComponent;
  let fixture: ComponentFixture<QualiteIndividuelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualiteIndividuelleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualiteIndividuelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
