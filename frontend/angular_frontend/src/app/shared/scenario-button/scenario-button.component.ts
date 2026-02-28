import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-scenario-button',
  imports: [],
  templateUrl: './scenario-button.component.html',
  styleUrl: './scenario-button.component.css'
})
export class ScenarioButtonComponent {
  @Input() scenarioName: string = '';
}
