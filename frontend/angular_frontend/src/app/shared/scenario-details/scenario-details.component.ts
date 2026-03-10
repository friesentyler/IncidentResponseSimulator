import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizComponent } from '../quiz/quiz.component';

@Component({
  selector: 'app-scenario-details',
  standalone: true,
  imports: [CommonModule, QuizComponent],
  templateUrl: './scenario-details.component.html',
  styleUrl: './scenario-details.component.css'
})
export class ScenarioDetailsComponent {
  @Input() scenarioTitle: string = 'Scenario Details';
  @Input() scenarioDescription: string = 'Select a scenario from the left to view details and start the interactive simulation or test your knowledge with a quiz.';
  @Input() scenarioStatus: string | undefined = '';
  @Input() scenarioId: number | undefined;

  @Output() launch = new EventEmitter<void>();

  showQuiz = false;

  onLaunch() {
    this.launch.emit();
  }

  onStartQuiz() {
    this.showQuiz = true;
  }

  onBackToDetails() {
    this.showQuiz = false;
  }
}
