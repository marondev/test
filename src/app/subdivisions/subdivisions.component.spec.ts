import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubdivisionsComponent } from './subdivisions.component';

describe('SubdivisionsComponent', () => {
  let component: SubdivisionsComponent;
  let fixture: ComponentFixture<SubdivisionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubdivisionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubdivisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
