import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuizComponent } from './quiz.component';
import { QuizService } from '../../services/quiz.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Quiz, QuizSubmissionResult } from '../../models/quiz.model';

const MOCK_QUIZ: Quiz = {
  id: 1,
  title: 'Test Quiz',
  description: 'A test quiz',
  questions: [
    {
      id: 10, text: 'Q1?', question_type: 'multiple_choice', order: 1,
      choices: [
        { id: 100, text: 'A' },
        { id: 101, text: 'B' },
      ]
    },
    {
      id: 20, text: 'Q2?', question_type: 'select_all', order: 2,
      choices: [
        { id: 200, text: 'X' },
        { id: 201, text: 'Y' },
        { id: 202, text: 'Z' },
      ]
    }
  ]
};

const MOCK_RESULT: QuizSubmissionResult = {
  score: 1,
  total: 2,
  results: {
    '10': {
      correct: false,
      correct_choices: [{ id: 100, text: 'A', rationale: 'A is correct.' }]
    }
  }
};

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;
  let quizServiceSpy: jasmine.SpyObj<QuizService>;

  beforeEach(async () => {
    quizServiceSpy = jasmine.createSpyObj('QuizService', ['getQuiz', 'submitQuiz']);
    quizServiceSpy.getQuiz.and.returnValue(of(MOCK_QUIZ));
    quizServiceSpy.submitQuiz.and.returnValue(of(MOCK_RESULT));

    await TestBed.configureTestingModule({
      imports: [QuizComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: QuizService, useValue: quizServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    component.scenarioId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should auto-load quiz on init', () => {
    expect(quizServiceSpy.getQuiz).toHaveBeenCalledWith(1);
    expect(component.quiz()).toEqual(MOCK_QUIZ);
    expect(component.loading()).toBeFalse();
  });

  it('should set loadError on fetch failure', () => {
    quizServiceSpy.getQuiz.and.returnValue(throwError(() => new Error('fail')));
    component.startQuiz();
    expect(component.loadError()).toBeTrue();
    expect(component.loading()).toBeFalse();
  });

  // Navigation
  it('should start at question index 0', () => {
    expect(component.currentQuestionIndex()).toBe(0);
  });

  it('should navigate to next question', () => {
    component.nextQuestion();
    expect(component.currentQuestionIndex()).toBe(1);
  });

  it('should not go past last question', () => {
    component.nextQuestion();
    component.nextQuestion();
    expect(component.currentQuestionIndex()).toBe(1);
  });

  it('should navigate to previous question', () => {
    component.nextQuestion();
    component.prevQuestion();
    expect(component.currentQuestionIndex()).toBe(0);
  });

  it('should not go before first question', () => {
    component.prevQuestion();
    expect(component.currentQuestionIndex()).toBe(0);
  });

  it('should jump to specific question', () => {
    component.goToQuestion(1);
    expect(component.currentQuestionIndex()).toBe(1);
  });

  // Answer toggling
  it('should toggle multiple choice answer (replaces previous)', () => {
    component.toggleAnswer(10, 100, 'multiple_choice');
    expect(component.isChoiceSelected(10, 100)).toBeTrue();

    component.toggleAnswer(10, 101, 'multiple_choice');
    expect(component.isChoiceSelected(10, 100)).toBeFalse();
    expect(component.isChoiceSelected(10, 101)).toBeTrue();
  });

  it('should toggle select_all answers (adds/removes)', () => {
    component.toggleAnswer(20, 200, 'select_all');
    component.toggleAnswer(20, 201, 'select_all');
    expect(component.isChoiceSelected(20, 200)).toBeTrue();
    expect(component.isChoiceSelected(20, 201)).toBeTrue();

    // Deselect one
    component.toggleAnswer(20, 200, 'select_all');
    expect(component.isChoiceSelected(20, 200)).toBeFalse();
    expect(component.isChoiceSelected(20, 201)).toBeTrue();
  });

  // allAnswered
  it('should report allAnswered false when not all answered', () => {
    component.toggleAnswer(10, 100, 'multiple_choice');
    expect(component.allAnswered()).toBeFalse();
  });

  it('should report allAnswered true when all answered', () => {
    component.toggleAnswer(10, 100, 'multiple_choice');
    component.toggleAnswer(20, 200, 'select_all');
    expect(component.allAnswered()).toBeTrue();
  });

  // isQuestionAnswered
  it('should track which questions are answered', () => {
    expect(component.isQuestionAnswered(10)).toBeFalse();
    component.toggleAnswer(10, 100, 'multiple_choice');
    expect(component.isQuestionAnswered(10)).toBeTrue();
  });

  // Submit
  it('should submit answers and set result', () => {
    component.toggleAnswer(10, 100, 'multiple_choice');
    component.toggleAnswer(20, 200, 'select_all');
    component.submit();
    expect(quizServiceSpy.submitQuiz).toHaveBeenCalled();
    expect(component.result()).toEqual(MOCK_RESULT);
  });

  it('should not submit if not all answered', () => {
    component.toggleAnswer(10, 100, 'multiple_choice');
    component.submit();
    expect(quizServiceSpy.submitQuiz).not.toHaveBeenCalled();
  });

  // Result navigation
  it('should navigate results forward and backward', () => {
    component.toggleAnswer(10, 100, 'multiple_choice');
    component.toggleAnswer(20, 200, 'select_all');
    component.submit();

    expect(component.resultQuestionIndex()).toBe(0);
    component.nextResult();
    expect(component.resultQuestionIndex()).toBe(1);
    component.prevResult();
    expect(component.resultQuestionIndex()).toBe(0);
  });

  it('should jump to specific result', () => {
    component.goToResult(1);
    expect(component.resultQuestionIndex()).toBe(1);
  });

  // currentQuestion / currentResultQuestion computed
  it('should return current question based on index', () => {
    expect(component.currentQuestion()?.id).toBe(10);
    component.nextQuestion();
    expect(component.currentQuestion()?.id).toBe(20);
  });

  it('should return current result question based on index', () => {
    expect(component.currentResultQuestion()?.id).toBe(10);
    component.goToResult(1);
    expect(component.currentResultQuestion()?.id).toBe(20);
  });
});
