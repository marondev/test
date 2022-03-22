import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdinanceModalComponent } from './ordinance-modal.component';

describe('OrdinanceModalComponent', () => {
  let component: OrdinanceModalComponent;
  let fixture: ComponentFixture<OrdinanceModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdinanceModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdinanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
