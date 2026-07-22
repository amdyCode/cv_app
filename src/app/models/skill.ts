import { FormControl } from "@angular/forms";

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface SoftSkill {
  id: string;
  name: string;
}

export interface SkillForm {
  id: FormControl<string | null>;
  name: FormControl<string | null>;
  level: FormControl<string | null>;
}

export interface SoftSkillForm {
  id: FormControl<string | null>;
  name: FormControl<string | null>;
}