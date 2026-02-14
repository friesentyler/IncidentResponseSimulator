import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Home Page',
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    title: 'Register Page',
  }
];
