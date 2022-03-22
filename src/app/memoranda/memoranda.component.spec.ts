import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorandaComponent } from './memoranda.component';

describe('MemorandaComponent', () => {
  let component: MemorandaComponent;
  let fixture: ComponentFixture<MemorandaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemorandaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemorandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
