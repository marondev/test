import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdinancesComponent } from './ordinances.component';

describe('OrdinancesComponent', () => {
  let component: OrdinancesComponent;
  let fixture: ComponentFixture<OrdinancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdinancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdinancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
