import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgoAccreditationComponent } from './ngo-accreditation.component';

describe('NgoAccreditationComponent', () => {
  let component: NgoAccreditationComponent;
  let fixture: ComponentFixture<NgoAccreditationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgoAccreditationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgoAccreditationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
