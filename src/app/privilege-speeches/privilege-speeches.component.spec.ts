import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivilegeSpeechesComponent } from './privilege-speeches.component';

describe('PrivilegeSpeechesComponent', () => {
  let component: PrivilegeSpeechesComponent;
  let fixture: ComponentFixture<PrivilegeSpeechesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivilegeSpeechesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivilegeSpeechesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
