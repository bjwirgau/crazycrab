import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReviewyourseafoodPage } from './reviewyourseafood.page';

describe('ReviewyourseafoodPage', () => {
  let component: ReviewyourseafoodPage;
  let fixture: ComponentFixture<ReviewyourseafoodPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewyourseafoodPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewyourseafoodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
