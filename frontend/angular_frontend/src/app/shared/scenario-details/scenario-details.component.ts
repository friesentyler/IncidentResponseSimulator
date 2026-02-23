import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scenario-details',
  imports: [],
  templateUrl: './scenario-details.component.html',
  styleUrl: './scenario-details.component.css'
})
export class ScenarioDetailsComponent {
  @Input() scenarioTitle: string = 'Scenario Details';
  @Input() scenarioDescription: string = 'Select a scenario from the left to view details and start the interactive simulation or test your knowledge with a quiz.';
}
