import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideRouter([])],
    })
      .compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', fakeAsync(() => {
    createComponent();
    tick(5000);
    expect(component).toBeTruthy();
  }));

  it('should render title after typewriter completes', fakeAsync(() => {
    createComponent();
    tick(5000);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toContain(component.title);
  }));

  it('should render CTA button text', fakeAsync(() => {
    createComponent();
    tick(5000);
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button.nb-button');
    expect(button?.textContent).toEqual(component.ctaButtonText);
  }));

  it('should call onCTAButtonClick when button is clicked', fakeAsync(() => {
    createComponent();
    tick(5000);
    spyOn(component, 'onCTAButtonClick');
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button.nb-button') as HTMLButtonElement;
    button.click();
    expect(component.onCTAButtonClick).toHaveBeenCalled();
  }));

  it('should have hero text', fakeAsync(() => {
    createComponent();
    tick(5000);
    fixture.detectChanges();
    const homePage: HTMLElement = fixture.debugElement.nativeElement;
    const heroText: any = homePage.querySelector('h2');
    expect(heroText.textContent).toEqual(component.heroText);
    expect(heroText).toBeTruthy();
  }));
});
