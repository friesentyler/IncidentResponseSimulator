import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  constructor(private router: Router) { }

  title: string = 'Incident Response Simulator';
  heroText: string = 'Compelling marketing copy blah blah blah';
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

  onCTAButtonClick(): any {
    this.router.navigate(['/register']);
  }
}
