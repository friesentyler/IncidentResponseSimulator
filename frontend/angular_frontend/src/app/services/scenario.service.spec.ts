import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ScenarioService, Scenario, ScenarioResponse } from './scenario.service';
import { environment } from '../../environments/environment';

describe('ScenarioService', () => {
    let service: ScenarioService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ScenarioService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(ScenarioService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get scenarios', () => {
        const mockResponse: ScenarioResponse = {
            count: 1,
            next: null,
            previous: null,
            results: [{
                id: 1,
                scenario_name: 'Test Scenario',
                scenario_description: 'Test Desc',
                scenario_status: 'inactive',
                download_url: null
            }]
        };

        service.getScenarios().subscribe(response => {
            expect(response).toEqual(mockResponse);
            expect(response.results.length).toBe(1);
        });

        const req = httpTestingController.expectOne(`${environment.apiUrl}scenarios/`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockResponse);
    });

    it('should get a single scenario', () => {
        const mockScenario: Scenario = {
            id: 1,
            scenario_name: 'Test',
            scenario_description: 'Test',
            scenario_status: 'loading',
            download_url: null
        };

        service.getScenario(1).subscribe(scenario => {
            expect(scenario).toEqual(mockScenario);
        });

        const req = httpTestingController.expectOne(`${environment.apiUrl}scenarios/1/`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockScenario);
    });

    it('should update scenario status', () => {
        const mockScenario: Scenario = {
            id: 1,
            scenario_name: 'Test',
            scenario_description: 'Test',
            scenario_status: 'loading',
            download_url: null
        };

        service.updateScenarioStatus(1, 'loading').subscribe(scenario => {
            expect(scenario).toEqual(mockScenario);
        });

        const req = httpTestingController.expectOne(`${environment.apiUrl}scenarios/1/`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual({ scenario_status: 'loading' });
        req.flush(mockScenario);
    });
 
    it('should include download_url when active', () => {
        const mockScenario: Scenario = {
            id: 1,
            scenario_name: 'Test',
            scenario_description: 'Test',
            scenario_status: 'active',
            download_url: 'http://localhost:8000/media/test.txt'
        };
 
        service.getScenario(1).subscribe(scenario => {
            expect(scenario.download_url).toBe('http://localhost:8000/media/test.txt');
        });
 
        const req = httpTestingController.expectOne(`${environment.apiUrl}scenarios/1/`);
        req.flush(mockScenario);
    });
});
