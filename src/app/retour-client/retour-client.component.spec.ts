import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetourClientComponent } from './retour-client.component';

describe('RetourClientComponent', () => {
  let component: RetourClientComponent;
  let fixture: ComponentFixture<RetourClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetourClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetourClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
