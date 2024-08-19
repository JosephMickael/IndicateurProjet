import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetardDeLivraisonComponent } from './retard-de-livraison.component';

describe('RetardDeLivraisonComponent', () => {
  let component: RetardDeLivraisonComponent;
  let fixture: ComponentFixture<RetardDeLivraisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetardDeLivraisonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetardDeLivraisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
