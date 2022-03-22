import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeReportsModalComponent } from './committee-reports-modal.component';

describe('CommitteeReportsModalComponent', () => {
  let component: CommitteeReportsModalComponent;
  let fixture: ComponentFixture<CommitteeReportsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommitteeReportsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteeReportsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
