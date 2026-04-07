import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Scenario {
    id: number;
    scenario_name: string;
    scenario_description: string;
    scenario_status: 'active' | 'inactive' | 'loading' | 'resetting';
    requires_higher_tier: boolean;
    download_url: string | null;
}

export interface ScenarioResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Scenario[];
}

@Injectable({
    providedIn: 'root'
})
export class ScenarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}scenarios/`;

    getScenarios(): Observable<ScenarioResponse> {
        return this.http.get<ScenarioResponse>(this.apiUrl);
    }

    getScenario(id: number): Observable<Scenario> {
        return this.http.get<Scenario>(`${this.apiUrl}${id}/`);
    }

    updateScenarioStatus(id: number, status: string): Observable<Scenario> {
        return this.http.patch<Scenario>(`${this.apiUrl}${id}/`, { scenario_status: status });
    }
}
