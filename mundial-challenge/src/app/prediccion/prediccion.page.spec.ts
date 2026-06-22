import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrediccionPage } from './prediccion.page';

describe('PrediccionPage', () => {
  let component: PrediccionPage;
  let fixture: ComponentFixture<PrediccionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrediccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
