import { Component } from '@angular/core';
import { ScenarioButtonComponent } from '../shared/scenario-button/scenario-button.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [ScenarioButtonComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {
}
