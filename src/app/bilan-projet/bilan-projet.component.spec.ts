import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BilanProjetComponent } from './bilan-projet.component';

describe('BilanProjetComponent', () => {
  let component: BilanProjetComponent;
  let fixture: ComponentFixture<BilanProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BilanProjetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BilanProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
