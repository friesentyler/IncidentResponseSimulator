import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizComponent } from './quiz.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
