import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home-page',
  imports: [NavbarComponent, NgOptimizedImage],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
  constructor(private router: Router) { }

  title: string = 'Incident Response Simulator';
  heroText: string = 'Compelling marketing copy blah blah blah';
  ctaButtonText: string = "Let's Go!";

  onCTAButtonClick(): any {
    this.router.navigate(['/register']);
  }
}
