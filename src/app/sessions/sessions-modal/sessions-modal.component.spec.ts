import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsModalComponent } from './sessions-modal.component';

describe('SessionsModalComponent', () => {
  let component: SessionsModalComponent;
  let fixture: ComponentFixture<SessionsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
