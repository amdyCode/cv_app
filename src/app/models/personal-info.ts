import { FormControl } from "@angular/forms";

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  subtitle: string;
  photoUrl: string;
  age: number | null;
  email: string;
  phonePrefix: string;
  phone: string;
  github: string;
  social: string;
  summary: string;
}

export interface PersonalInfoForm {
  fullName: FormControl<string | null>;
  jobTitle: FormControl<string | null>;
  subtitle: FormControl<string | null>;
  photoUrl: FormControl<string | null>;
  age: FormControl<number | null>;
  email: FormControl<string | null>;
  phonePrefix: FormControl<string | null>;
  phone: FormControl<string | null>;
  github: FormControl<string | null>;
  social: FormControl<string | null>;
  summary: FormControl<string | null>;
}