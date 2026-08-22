import { TestBed } from '@angular/core/testing';

import { CvExportService } from './cv-export-service';

describe('CvExportService', () => {
  let service: CvExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CvExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
