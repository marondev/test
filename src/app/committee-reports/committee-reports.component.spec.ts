import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeReportsComponent } from './committee-reports.component';

describe('CommitteeReportsComponent', () => {
  let component: CommitteeReportsComponent;
  let fixture: ComponentFixture<CommitteeReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommitteeReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteeReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
