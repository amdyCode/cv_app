import { FormControl } from "@angular/forms";

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface LanguageForm {
  id: FormControl<string | null>;
  name: FormControl<string | null>;
  level: FormControl<string | null>;
}