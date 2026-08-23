import { Injectable } from '@angular/core';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class CvExportService {
  private apiUrl = `${environment.apiUrl}/generate-pdf`;

  constructor() {}

  async exportToPdf(previewElement: HTMLElement, fileName: string = 'mon_cv.pdf'): Promise<void> {
    try {
      const clone = document.documentElement.cloneNode(true) as HTMLElement;
      const body = clone.querySelector('body');
      if (body) {
        body.innerHTML = '';
        body.appendChild(previewElement.cloneNode(true));
        body.style.margin = '0';
        body.style.padding = '0';
        body.style.backgroundColor = 'white';
      }
      
      const fullHtml = clone.outerHTML;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html: fullHtml })
      });

      if (!response.ok) {
        let errorMsg = 'Erreur lors de la génération du PDF.';
        try {
          const errorData = await response.json();
          errorMsg = JSON.stringify(errorData);
        } catch(e) {}
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Impossible de générer le PDF. Veuillez réessayer plus tard.');
    }
  }
}
