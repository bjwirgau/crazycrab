import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PickyoursaucePage } from './pickyoursauce.page';

describe('PickyoursaucePage', () => {
  let component: PickyoursaucePage;
  let fixture: ComponentFixture<PickyoursaucePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickyoursaucePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PickyoursaucePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
