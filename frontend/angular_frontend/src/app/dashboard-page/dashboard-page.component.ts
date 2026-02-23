import { Component } from '@angular/core';
import { ScenarioButtonComponent } from '../shared/scenario-button/scenario-button.component';
import { ScenarioDetailsComponent } from '../shared/scenario-details/scenario-details.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [ScenarioButtonComponent, ScenarioDetailsComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {
}
