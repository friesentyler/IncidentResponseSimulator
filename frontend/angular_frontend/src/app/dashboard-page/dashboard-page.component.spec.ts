import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DashboardPageComponent } from './dashboard-page.component';
import { environment } from '../../environments/environment';
import { ScenarioResponse } from '../services/scenario.service';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let httpTestingController: HttpTestingController;

  const mockScenarios: ScenarioResponse = {
    count: 2,
    next: null,
    previous: null,
    results: [
      { id: 1, scenario_name: 'S1', scenario_description: 'D1', scenario_status: 'inactive' as const, download_url: null },
      { id: 2, scenario_name: 'S2', scenario_description: 'D2', scenario_status: 'loading' as const, download_url: null }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // calls ngOnInit

    // Expect the initial getScenarios call
    const req = httpTestingController.expectOne(`${environment.apiUrl}scenarios/`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockScenarios);
  });

  afterEach(() => {
    httpTestingController.verify();
    component.ngOnDestroy(); // stop any polling
  });

  it('should create and auto-select the first scenario', () => {
    expect(component).toBeTruthy();
    expect(component.scenarios().length).toBe(2);
    expect(component.selectedScenario()?.id).toBe(1);
  });

  it('should change selected scenario', () => {
    component.selectScenario(mockScenarios.results[1]);
    expect(component.selectedScenario()?.id).toBe(2);
    // Because it's 'loading', it should start polling.
  });

  it('should launch a scenario', () => {
    // Current is S1 (inactive)
    component.launchScenario();

    // Expect PATCH request to update to 'loading'
    const patchReq = httpTestingController.expectOne(`${environment.apiUrl}scenarios/1/`);
    expect(patchReq.request.method).toEqual('PATCH');
    expect(patchReq.request.body).toEqual({ scenario_status: 'loading' });

    const updatedS1 = { ...mockScenarios.results[0], scenario_status: 'loading' as const, download_url: null };
    patchReq.flush(updatedS1);

    expect(component.selectedScenario()?.scenario_status).toBe('loading');
  });

  it('should poll when status is loading', fakeAsync(() => {
    // Select S2 which is 'loading'
    component.selectScenario(mockScenarios.results[1]);

    // Fast forward 5 seconds
    tick(5000);

    const pollReq = httpTestingController.expectOne(`${environment.apiUrl}scenarios/2/`);
    expect(pollReq.request.method).toEqual('GET');

    const activeS2 = { ...mockScenarios.results[1], scenario_status: 'active' as const };
    pollReq.flush(activeS2);

    expect(component.selectedScenario()?.scenario_status).toBe('active');
  }));
 
  it('should trigger download when status becomes active and download_url is present', fakeAsync(() => {
    const spy = spyOn<any>(component, 'triggerFileDownload');
 
    // Select S2 which is 'loading'
    component.selectScenario(mockScenarios.results[1]);
 
    tick(5000);
 
    const pollReq = httpTestingController.expectOne(`${environment.apiUrl}scenarios/2/`);
    const activeS2 = { 
      ...mockScenarios.results[1], 
      scenario_status: 'active' as const, 
      download_url: 'http://localhost:8000/media/secret.txt' 
    };
    pollReq.flush(activeS2);
 
    expect(spy).toHaveBeenCalledWith('http://localhost:8000/media/secret.txt');
  }));
});
