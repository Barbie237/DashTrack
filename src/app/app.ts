import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrackingComponent } from "./components/tracking/tracking.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('DashTrack');
}
