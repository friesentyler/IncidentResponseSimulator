import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioButtonComponent } from '../shared/scenario-button/scenario-button.component';
import { ScenarioDetailsComponent } from '../shared/scenario-details/scenario-details.component';
import { ScenarioService, Scenario } from '../services/scenario.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, ScenarioButtonComponent, ScenarioDetailsComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private scenarioService = inject(ScenarioService);

  // Signals for reactive state
  scenarios = signal<Scenario[]>([]);
  selectedScenario = signal<Scenario | null>(null);

  private poller: any;

  ngOnInit() {
    this.refreshScenarios();
  }

  refreshScenarios() {
    this.scenarioService.getScenarios().subscribe(response => {
      this.scenarios.set(response.results);

      const current = this.selectedScenario();
      if (!current && response.results.length > 0) {
        // Auto-select first one on initial load
        this.selectScenario(response.results[0]);
      } else if (current) {
        // Sync selected scenario data with the new list data
        const updated = response.results.find(s => s.id === current.id);
        if (updated) {
          this.selectedScenario.set(updated);
          this.checkPolling(updated);
        }
      }
    });
  }

  selectScenario(scenario: Scenario) {
    this.selectedScenario.set(scenario);
    this.checkPolling(scenario);
  }

  launchScenario() {
    const current = this.selectedScenario();
    if (current && current.scenario_status === 'inactive') {
      this.scenarioService.updateScenarioStatus(current.id, 'loading').subscribe(updated => {
        this.selectedScenario.set(updated);
        this.startPolling(updated.id);
        // Also update the list item
        this.scenarios.update(list => list.map(s => s.id === updated.id ? updated : s));
      });
    } else if (current && current.scenario_status === 'active') {
      this.scenarioService.updateScenarioStatus(current.id, 'resetting').subscribe(updated => {
        this.selectedScenario.set(updated);
        this.startPolling(updated.id);
        this.scenarios.update(list => list.map(s => s.id === updated.id ? updated : s));
      });
    }
  }

  private checkPolling(scenario: Scenario) {
    if (scenario.scenario_status === 'loading' || scenario.scenario_status === 'resetting') {
      this.startPolling(scenario.id);
    } else {
      this.stopPolling();
    }
  }

  private startPolling(id: number) {
    if (this.poller) return; // Already polling

    this.poller = setInterval(() => {
      this.scenarioService.getScenario(id).subscribe(updated => {
        this.selectedScenario.set(updated);
        this.scenarios.update(list => list.map(s => s.id === updated.id ? updated : s));

        if (updated.scenario_status === 'active') {
          if (updated.download_url) {
            this.triggerFileDownload(updated.download_url);
          }
          this.stopPolling();
        } else if (updated.scenario_status === 'inactive') {
          this.stopPolling();
        }
      });
    }, 5000);
  }

  private triggerFileDownload(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private stopPolling() {
    if (this.poller) {
      clearInterval(this.poller);
      this.poller = null;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }
}
