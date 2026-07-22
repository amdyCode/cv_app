import { FormControl } from "@angular/forms";

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ExperienceForm {
  id: FormControl<string | null>;
  company: FormControl<string | null>;
  position: FormControl<string | null>;
  startDate: FormControl<string | null>;
  endDate: FormControl<string | null>;
  description: FormControl<string | null>;
}