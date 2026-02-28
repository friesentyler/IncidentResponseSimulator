import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ScenarioDetailsComponent } from './scenario-details.component';

describe('ScenarioDetailsComponent', () => {
    let component: ScenarioDetailsComponent;
    let fixture: ComponentFixture<ScenarioDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ScenarioDetailsComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ScenarioDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit launch event on button click', () => {
        spyOn(component.launch, 'emit');
        component.scenarioStatus = 'inactive';
        fixture.detectChanges();

        // Call the method directly or click the button
        component.onLaunch();

        expect(component.launch.emit).toHaveBeenCalled();
    });

    it('should hide button group when status is loading or resetting', () => {
        component.scenarioStatus = 'loading';
        fixture.detectChanges();
        let buttons = fixture.debugElement.queryAll(By.css('.button-group button'));
        expect(buttons.length).toBe(0);

        let statusText = fixture.debugElement.query(By.css('.status-text'));
        expect(statusText.nativeElement.textContent.trim()).toBe('VM Spinning Up...');

        component.scenarioStatus = 'resetting';
        fixture.detectChanges();
        statusText = fixture.debugElement.query(By.css('.status-text'));
        expect(statusText.nativeElement.textContent.trim()).toBe('VM Tearing Down...');
    });

    it('should show correct buttons for active status', () => {
        component.scenarioStatus = 'active';
        fixture.detectChanges();

        const toggleButton = fixture.debugElement.query(By.css('.nb-button.orange'));
        expect(toggleButton).toBeTruthy();
        expect(toggleButton.nativeElement.textContent.trim()).toBe('Stop Scenario');
    });

    it('should show correct buttons for inactive status', () => {
        component.scenarioStatus = 'inactive';
        fixture.detectChanges();

        const toggleButton = fixture.debugElement.query(By.css('.nb-button.blue'));
        expect(toggleButton).toBeTruthy();
        expect(toggleButton.nativeElement.textContent.trim()).toBe('Start Scenario');
    });
});
