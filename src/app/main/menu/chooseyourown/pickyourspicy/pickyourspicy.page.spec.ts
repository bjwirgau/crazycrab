import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PickyourspicyPage } from './pickyourspicy.page';

describe('PickyourspicyPage', () => {
  let component: PickyourspicyPage;
  let fixture: ComponentFixture<PickyourspicyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickyourspicyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PickyourspicyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
