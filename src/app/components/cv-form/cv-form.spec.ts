import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CvForm } from './cv-form';

describe('CvForm', () => {
  let component: CvForm;
  let fixture: ComponentFixture<CvForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
