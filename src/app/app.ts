import { Component, signal } from '@angular/core';
import { CvBuilder } from './components/cv-builder/cv-builder';

@Component({
  selector: 'app-root',
  imports: [CvBuilder],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('CV Generator');
}
