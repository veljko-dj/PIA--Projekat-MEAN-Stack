import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPassLoggedComponent } from './new-pass-logged.component';

describe('NewPassLoggedComponent', () => {
  let component: NewPassLoggedComponent;
  let fixture: ComponentFixture<NewPassLoggedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPassLoggedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPassLoggedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
