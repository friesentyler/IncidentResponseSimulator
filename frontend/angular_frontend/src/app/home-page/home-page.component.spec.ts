import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toEqual(component.title);
  });

  it('should render CTA button text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button.nb-button');
    expect(button?.textContent).toEqual(component.ctaButtonText);
  });

  it('should call onCTAButtonClick when button is clicked', () => {
    spyOn(component, 'onCTAButtonClick');
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button.nb-button') as HTMLButtonElement;
    button.click();
    expect(component.onCTAButtonClick).toHaveBeenCalled();
  });

  it('should have hero text', () => {
    const homePage: HTMLElement = fixture.debugElement.nativeElement;
    const heroText: any = homePage.querySelector('h2');
    expect(heroText.textContent).toEqual(component.heroText);
    expect(heroText).toBeTruthy();
  })
});
