import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CvForm } from '../cv-form/cv-form';
import { CvPreview } from '../cv-preview/cv-preview';

@Component({
  selector: 'app-cv-builder',
  imports: [CvForm, CvPreview],
  templateUrl: './cv-builder.html',
  styleUrls: ['./cv-builder.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvBuilder {
}
