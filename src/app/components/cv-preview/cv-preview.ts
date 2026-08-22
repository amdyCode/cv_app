import { Component, ChangeDetectionStrategy, inject, computed, ElementRef, signal } from '@angular/core';
import { CvStateService } from '../../services/cv-state/cv-state-service';
import { getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { CvExportService } from '../../services/cv-export/cv-export-service';

@Component({
  selector: 'app-cv-preview',
  imports: [],
  templateUrl: './cv-preview.html',
  styleUrls: ['./cv-preview.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvPreview {
  cvState = inject(CvStateService);
  cvExport = inject(CvExportService);
  elementRef = inject(ElementRef);
  isExporting = signal(false);

  themeColor = this.cvState.themeColor;
  personalInfo = this.cvState.personalInfo;
  experiences = this.cvState.experiences;
  projects = this.cvState.projects;
  education = this.cvState.education;
  skills = this.cvState.skills;
  softSkills = this.cvState.softSkills;
  languages = this.cvState.languages;

  phoneDisplay = computed(() => {
    const info = this.personalInfo();
    if (!info.phone) return '';
    try {
      const dialCode = `+${getCountryCallingCode(info.phonePrefix as CountryCode)}`;
      return `${dialCode} ${info.phone}`;
    } catch {
      return info.phone;
    }
  });

  getBulletPoints(text: string | undefined): string[] {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim().length > 0);
  }

  normalizeUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  }

  async downloadPdf() {
    this.isExporting.set(true);
    const container = this.elementRef.nativeElement.querySelector('.cv-preview-container');
    if (container) {
      const name = this.personalInfo().fullName || 'Export';
      const fileName = `CV_${name.replace(/\s+/g, '_')}.pdf`;
      await this.cvExport.exportToPdf(container as HTMLElement, fileName);
    }
    this.isExporting.set(false);
  }
}