import { Directive, HostListener, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[placeholder], textarea[placeholder]',
})
export class FillOnTab {
  private el = inject(ElementRef);
  private ngControl = inject(NgControl, { optional: true });

  @HostListener('keydown.tab')
  onKeydown() {
    const input = this.el.nativeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!input.value && input.placeholder) {
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(input.placeholder);
        this.ngControl.control.markAsDirty();
        this.ngControl.control.markAsTouched();
      } else {
        input.value = input.placeholder;
        input.dispatchEvent(new Event('input'));
      }
    }
  }
}
