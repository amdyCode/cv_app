import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CvStateService } from '../../services/cv-state-service';

@Component({
  selector: 'app-cv-preview',
  imports: [],
  templateUrl: './cv-preview.html',
  styleUrls: ['./cv-preview.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvPreview {
  cvState = inject(CvStateService);

  themeColor = this.cvState.themeColor;
  personalInfo = this.cvState.personalInfo;
  experiences = this.cvState.experiences;
  projects = this.cvState.projects;
  education = this.cvState.education;
  skills = this.cvState.skills;
  softSkills = this.cvState.softSkills;
  languages = this.cvState.languages;

  getBulletPoints(text: string | undefined): string[] {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim().length > 0);
  }
}