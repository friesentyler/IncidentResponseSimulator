import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) { }

  title: string = 'Incident Response Simulator';
  heroText: string = 'Test your defenses and sharpen your response protocols in our highly realistic, interactive incident simulator.';
  ctaButtonText: string = "Let's Go!";

  displayedTitle: string = '';
  showCursor: boolean = true;
  showContent: boolean = false;
  isPoweredOff: boolean = true;

  ngOnInit(): void {
    // Stage 1: CRT Power on visual
    setTimeout(() => {
      this.isPoweredOff = false;
    }, 100);

    // Stage 2: Initial typewriter delay (wait for boot animation)
    setTimeout(() => {
      this.typeTitle(0);
    }, 1200);
  }

  private typeTitle(index: number): void {
    if (index < this.title.length) {
      this.displayedTitle += this.title.charAt(index);
      setTimeout(() => this.typeTitle(index + 1), 60);
    } else {
      // Typing done — hide cursor and reveal content
      setTimeout(() => {
        this.showCursor = false;
        this.showContent = true;
      }, 400);
    }
  }

  onCTAButtonClick(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/register']);
    }
  }
}
