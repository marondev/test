import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolutionModalComponent } from './resolution-modal.component';

describe('ResolutionModalComponent', () => {
  let component: ResolutionModalComponent;
  let fixture: ComponentFixture<ResolutionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResolutionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResolutionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
