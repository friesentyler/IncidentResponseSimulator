import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-home-page',
  imports: [NavbarComponent, NgOptimizedImage],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  title: string = 'Incident Response Simulator';
  heroText: string = 'Compelling marketing copy blah blah blah';
  ctaButtonText: string = "Let's Go!";

  onCTAButtonClick(): any {
    // TODO: fill this method out
  }
}
