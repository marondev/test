import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleFranchiseComponent } from './vehicle-franchise.component';

describe('VehicleFranchiseComponent', () => {
  let component: VehicleFranchiseComponent;
  let fixture: ComponentFixture<VehicleFranchiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VehicleFranchiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleFranchiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
