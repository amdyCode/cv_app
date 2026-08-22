import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { CvFormModel } from "../models/cv";
import { PersonalInfoForm } from "../models/personal-info";
import { ExperienceForm } from "../models/experience";
import { ProjectForm } from "../models/project";
import { EducationForm } from "../models/education";
import { SkillForm, SoftSkillForm } from "../models/skill";
import { LanguageForm } from "../models/language";

export const DEFAULT_JSON_TEMPLATE = JSON.stringify({
  themeColor: "#082ee7",
  personalInfo: {
    fullName: "John Doe",
    jobTitle: "Ingénieur Logiciel",
    subtitle: "Recherche de nouvelles opportunités",
    age: 28,
    email: "john.doe@example.com",
    phonePrefix: "FR",
    phone: "06 12 34 56 78",
    github: "https://github.com/johndoe",
    social: "https://linkedin.com/in/johndoe",
    summary: "Passionné par le développement web et les architectures scalables."
  },
  experiences: [
    {
      company: "Tech Corp",
      position: "Lead Developer",
      startDate: "2020-01-15",
      endDate: "2024-06-30",
      description: "Gestion d'une équipe de 5 développeurs.\nOptimisation des performances."
    }
  ],
  projects: [
    {
      title: "Générateur de CV",
      technologies: "Angular, SCSS",
      description: "Application de création de CV dynamiques."
    }
  ],
  education: [
    {
      institution: "Université de Paris",
      degree: "Master en Informatique",
      fieldOfStudy: "Génie Logiciel",
      graduationDate: "2019-06-30"
    }
  ],
  skills: [
    { name: "Angular", level: "Advanced" },
    { name: "TypeScript", level: "Advanced" }
  ],
  softSkills: [
    { name: "Travail en équipe" },
    { name: "Communication" }
  ],
  languages: [
    { name: "Français", level: "Natif" },
    { name: "Anglais", level: "Courant" }
  ]
}, null, 2);


export const cvForm = new FormGroup<CvFormModel>({
    themeColor: new FormControl<string | null>('#082ee7'),
    personalInfo: new FormGroup<PersonalInfoForm>({
      fullName: new FormControl<string | null>(''),
      jobTitle: new FormControl<string | null>(''),
      subtitle: new FormControl<string | null>(''),
      photoUrl: new FormControl<string | null>(''),
      age: new FormControl<number | null>(null),
      email: new FormControl<string | null>(''),
      phonePrefix: new FormControl<string | null>('FR'),
      phone: new FormControl<string | null>(''),
      github: new FormControl<string | null>('', [Validators.pattern(/^https:\/\/github\.com\/.+/)]),
      social: new FormControl<string | null>('', [Validators.pattern(/^https:\/\/(www\.)?linkedin\.com\/.+/)]),
      summary: new FormControl<string | null>('')
    }),
    experiences: new FormArray<FormGroup<ExperienceForm>>([]),
    projects: new FormArray<FormGroup<ProjectForm>>([]),
    education: new FormArray<FormGroup<EducationForm>>([]),
    skills: new FormArray<FormGroup<SkillForm>>([]),
    softSkills: new FormArray<FormGroup<SoftSkillForm>>([]),
    languages: new FormArray<FormGroup<LanguageForm>>([])
  });
