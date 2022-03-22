import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolutionsComponent } from './resolutions.component';

describe('ResolutionsComponent', () => {
  let component: ResolutionsComponent;
  let fixture: ComponentFixture<ResolutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResolutionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
