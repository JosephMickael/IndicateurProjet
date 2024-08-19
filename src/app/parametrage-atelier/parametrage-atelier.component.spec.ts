import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageAtelierComponent } from './parametrage-atelier.component';

describe('ParametrageAtelierComponent', () => {
  let component: ParametrageAtelierComponent;
  let fixture: ComponentFixture<ParametrageAtelierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParametrageAtelierComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParametrageAtelierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
