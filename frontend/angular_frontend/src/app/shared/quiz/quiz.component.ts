import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';
import { Quiz, Question, QuizSubmissionResult } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {
  ngOnInit() {
    this.startQuiz();
  }

  @Input() scenarioId!: number;
  @Output() exit = new EventEmitter<void>();
  private quizService = inject(QuizService);

  quiz = signal<Quiz | null>(null);
  quizStarted = signal<boolean>(false);
  currentQuestionIndex = signal<number>(0);
  userAnswers = signal<{ [questionId: string]: number[] }>({});
  result = signal<QuizSubmissionResult | null>(null);
  loading = signal<boolean>(false);
  loadError = signal<boolean>(false);

  currentQuestion = computed(() => {
    const q = this.quiz();
    if (!q) return null;
    return q.questions[this.currentQuestionIndex()];
  });

  allAnswered = computed(() => {
    const q = this.quiz();
    if (!q) return false;
    const answers = this.userAnswers();
    return q.questions.every(question => {
      const ans = answers[question.id.toString()];
      return ans && ans.length > 0;
    });
  });

  startQuiz() {
    if (!this.scenarioId) return;
    this.loading.set(true);
    this.loadError.set(false);
    this.quizStarted.set(true);
    this.quizService.getQuiz(this.scenarioId).subscribe({
      next: (data) => {
        this.quiz.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load quiz', err);
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  nextQuestion() {
    const max = this.quiz()?.questions.length || 0;
    if (this.currentQuestionIndex() < max - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex.set(index);
  }

  toggleAnswer(questionId: number, choiceId: number, type: 'multiple_choice' | 'select_all') {
    this.userAnswers.update(current => {
      const qIdStr = questionId.toString();
      const existing = current[qIdStr] || [];
      if (type === 'multiple_choice') {
        current[qIdStr] = [choiceId];
      } else {
        if (existing.includes(choiceId)) {
          current[qIdStr] = existing.filter(id => id !== choiceId);
        } else {
          current[qIdStr] = [...existing, choiceId];
        }
      }
      return { ...current };
    });
  }

  isChoiceSelected(questionId: number, choiceId: number): boolean {
    const qIdStr = questionId.toString();
    const answers = this.userAnswers()[qIdStr] || [];
    return answers.includes(choiceId);
  }

  isQuestionAnswered(questionId: number): boolean {
    const answers = this.userAnswers()[questionId.toString()];
    return answers && answers.length > 0;
  }

  submit() {
    if (this.allAnswered()) {
      this.quizService.submitQuiz(this.scenarioId, this.userAnswers()).subscribe({
        next: (res) => {
          this.result.set(res);
        },
        error: (err) => {
          console.error("Failed to submit quiz", err);
        }
      });
    }
  }
}
