import { FormControl } from "@angular/forms";

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
}

export interface EducationForm {
  id: FormControl<string | null>;
  institution: FormControl<string | null>;
  degree: FormControl<string | null>;
  fieldOfStudy: FormControl<string | null>;
  graduationDate: FormControl<string | null>;
}