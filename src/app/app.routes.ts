import { Routes } from '@angular/router';
import { TrackingComponent } from './components/tracking/tracking.component';
import { DashboardComponent } from './dashboard/dashboard';

export const routes: Routes = [
     { path: '', component: TrackingComponent },
   { path: 'dashboard', component: DashboardComponent },
];
