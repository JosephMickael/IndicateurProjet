import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualiteProjetComponent } from './qualite-projet.component';

describe('QualiteProjetComponent', () => {
  let component: QualiteProjetComponent;
  let fixture: ComponentFixture<QualiteProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualiteProjetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualiteProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
