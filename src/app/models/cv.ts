import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { Education, EducationForm } from "./education";
import { Experience, ExperienceForm } from "./experience";
import { Language, LanguageForm } from "./language";
import { PersonalInfo, PersonalInfoForm } from "./personal-info";
import { Project, ProjectForm } from "./project";
import { Skill, SkillForm, SoftSkill, SoftSkillForm } from "./skill";

export interface CvData {
  themeColor: string;
  personalInfo: PersonalInfo;
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skills: Skill[];
  softSkills: SoftSkill[];
  languages: Language[];
}

export interface CvFormModel {
  themeColor: FormControl<string | null>;
  personalInfo: FormGroup<PersonalInfoForm>;
  experiences: FormArray<FormGroup<ExperienceForm>>;
  projects: FormArray<FormGroup<ProjectForm>>;
  education: FormArray<FormGroup<EducationForm>>;
  skills: FormArray<FormGroup<SkillForm>>;
  softSkills: FormArray<FormGroup<SoftSkillForm>>;
  languages: FormArray<FormGroup<LanguageForm>>;
}