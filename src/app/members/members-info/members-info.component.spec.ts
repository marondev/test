import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersInfoComponent } from './members-info.component';

describe('MembersInfoComponent', () => {
  let component: MembersInfoComponent;
  let fixture: ComponentFixture<MembersInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembersInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
