import { FormControl } from "@angular/forms";

export interface Project {
  id: string;
  title: string;
  technologies: string;
  description: string;
}

export interface ProjectForm {
  id: FormControl<string | null>;
  title: FormControl<string | null>;
  technologies: FormControl<string | null>;
  description: FormControl<string | null>;
}