import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl, Validators } from '@angular/forms';
import { CvStateService } from '../../services/cv-state-service';
import { Subject, takeUntil } from 'rxjs';
import { getCountries, getCountryCallingCode, getExampleNumber, isValidPhoneNumber, AsYouType, CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { FillOnTab } from '../../directives/fill-on-tab';

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

export interface ExperienceForm {
  id: FormControl<string | null>;
  company: FormControl<string | null>;
  position: FormControl<string | null>;
  startDate: FormControl<string | null>;
  endDate: FormControl<string | null>;
  description: FormControl<string | null>;
}

export interface ProjectForm {
  id: FormControl<string | null>;
  title: FormControl<string | null>;
  technologies: FormControl<string | null>;
  description: FormControl<string | null>;
}

export interface EducationForm {
  id: FormControl<string | null>;
  institution: FormControl<string | null>;
  degree: FormControl<string | null>;
  fieldOfStudy: FormControl<string | null>;
  graduationDate: FormControl<string | null>;
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

export interface LanguageForm {
  id: FormControl<string | null>;
  name: FormControl<string | null>;
  level: FormControl<string | null>;
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

@Component({
  selector: 'app-cv-form',
  imports: [ReactiveFormsModule, FillOnTab],
  templateUrl: './cv-form.html',
  styleUrls: ['./cv-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvForm implements OnInit, OnDestroy {
  private cvState = inject(CvStateService);
  private destroy$ = new Subject<void>();

  countries: { code: string, dialCode: string, flag: string, name: string }[] = [];
  phonePlaceholder: string = '6 12 34 56 78';
  phoneError: string = '';
  phoneComplete: boolean = false;
  private lastFormattedPhone: string = '';

  jsonInputControl = new FormControl<string>('');
  jsonError = '';
  jsonSuccess = false;

  DEFAULT_JSON_TEMPLATE = JSON.stringify({
    themeColor: "#eab308",
    personalInfo: {
      fullName: "John Doe",
      jobTitle: "Ingénieur Logiciel",
      subtitle: "Recherche de nouvelles opportunités",
      photoUrl: "https://i.pravatar.cc/300",
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
        startDate: "Jan 2020",
        endDate: "Présent",
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
        graduationDate: "2019"
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

  cvForm = new FormGroup<CvFormModel>({
    themeColor: new FormControl<string | null>('#eab308'),
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

  ngOnInit() {
    this.initCountries();
    this.updatePhonePlaceholder('FR');

    // Écouter les changements de pays pour mettre à jour le placeholder et réinitialiser
    this.cvForm.controls.personalInfo.controls.phonePrefix.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(code => {
        if (code) {
          this.updatePhonePlaceholder(code as CountryCode);
          // Réinitialiser le téléphone quand le pays change
          this.phoneComplete = false;
          this.lastFormattedPhone = '';
          this.phoneError = '';
          this.cvForm.controls.personalInfo.controls.phone.setValue('', { emitEvent: true });
        }
      });

    this.cvForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value.themeColor) {
        this.cvState.updateThemeColor(value.themeColor);
      }
      if (value.personalInfo) {
        this.cvState.updatePersonalInfo(value.personalInfo as any);
      }
      if (value.experiences) {
        this.cvState.setExperiences(value.experiences as any);
      }
      if (value.projects) {
        this.cvState.setProjects(value.projects as any);
      }
      if (value.education) {
        this.cvState.setEducation(value.education as any);
      }
      if (value.skills) {
        this.cvState.setSkills(value.skills as any);
      }
      if (value.softSkills) {
        this.cvState.setSoftSkills(value.softSkills as any);
      }
      if (value.languages) {
        this.cvState.setLanguages(value.languages as any);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initCountries() {
    const codes = getCountries();
    const displayNames = new Intl.DisplayNames(['fr'], { type: 'region' });
    
    this.countries = codes.map(country => {
      let name: string = country;
      try { name = displayNames.of(country) || country; } catch(e) {}
      
      return {
        code: country,
        dialCode: `+${getCountryCallingCode(country)}`,
        flag: this.getFlagEmoji(country),
        name: name
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  updatePhonePlaceholder(countryCode: CountryCode) {
    try {
      const exampleNumber = getExampleNumber(countryCode, examples as any);
      if (exampleNumber) {
        this.phonePlaceholder = exampleNumber.formatNational();
      } else {
        this.phonePlaceholder = '';
      }
    } catch (e) {
      this.phonePlaceholder = '';
    }
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const countryCode = this.cvForm.controls.personalInfo.controls.phonePrefix.value;
    if (!countryCode) return;

    // Extraire uniquement les chiffres
    let digits = input.value.replace(/\D/g, '');

    if (this.phoneComplete) {
      const prevDigits = this.lastFormattedPhone.replace(/\D/g, '');
      if (digits.length > prevDigits.length) {
        this.cvForm.controls.personalInfo.controls.phone.setValue(this.lastFormattedPhone);
        return;
      }
      this.phoneComplete = false;
    }

    const formatter = new AsYouType(countryCode as CountryCode);
    const formatted = formatter.input(digits);

    const phoneNumber = formatter.getNumber();
    this.phoneComplete = !!(phoneNumber && phoneNumber.isValid());
    this.lastFormattedPhone = formatted;

    if (digits.length === 0) {
      this.phoneError = '';
    } else if (this.phoneComplete) {
      this.phoneError = '';
    } else {
      this.phoneError = `Format attendu : ${this.phonePlaceholder}`;
    }

    this.cvForm.controls.personalInfo.controls.phone.setValue(formatted);
  }

  getDialCodeForCountry(countryCode: string): string {
    try {
      return `+${getCountryCallingCode(countryCode as CountryCode)}`;
    } catch {
      return countryCode;
    }
  }

  loadJsonTemplate() {
    this.jsonInputControl.setValue(this.DEFAULT_JSON_TEMPLATE);
    this.jsonError = '';
    this.jsonSuccess = false;
  }

  importJson() {
    this.jsonError = '';
    this.jsonSuccess = false;
    const jsonString = this.jsonInputControl.value;
    if (!jsonString) {
      this.jsonError = "Le champ JSON est vide.";
      return;
    }

    try {
      const data = JSON.parse(jsonString);
      
      if (typeof data !== 'object' || data === null) {
        throw new Error("Le JSON doit être un objet.");
      }

      const pInfo = data.personalInfo;
      if (pInfo) {
        if (pInfo.age !== undefined && pInfo.age !== null && typeof pInfo.age !== 'number') {
          throw new Error("Erreur de type : personalInfo.age doit être un nombre.");
        }
        if (pInfo.fullName !== undefined && pInfo.fullName !== null && typeof pInfo.fullName !== 'string') {
          throw new Error("Erreur de type : personalInfo.fullName doit être du texte.");
        }
        if (pInfo.email !== undefined && pInfo.email !== null && typeof pInfo.email !== 'string') {
          throw new Error("Erreur de type : personalInfo.email doit être du texte.");
        }

        if (pInfo.phonePrefix) {
          if (typeof pInfo.phonePrefix !== 'string') {
            throw new Error("Erreur : phonePrefix doit être une chaîne (ex: 'FR').");
          }
          if (!this.countries.some(c => c.code === pInfo.phonePrefix)) {
            throw new Error(`Code pays invalide : ${pInfo.phonePrefix}. Utilisez un code ISO (ex: FR, US, CH).`);
          }
        }

        if (pInfo.phone !== undefined && pInfo.phone !== null) {
          const rawPhone = String(pInfo.phone).replace(/\D/g, '');
          const countryCode = (pInfo.phonePrefix as CountryCode) || 'FR';
          const formatter = new AsYouType(countryCode);
          const formatted = formatter.input(rawPhone);
          const phoneNumber = formatter.getNumber();
          
          if (!phoneNumber || !phoneNumber.isValid()) {
             throw new Error(`Le numéro de téléphone n'est pas valide pour la région ${countryCode}.`);
          }
          pInfo.phone = formatted;
        }

        if (pInfo.github) {
          if (typeof pInfo.github !== 'string' || !pInfo.github.startsWith('https://github.com/')) {
            throw new Error("Erreur de format : personalInfo.github doit commencer par 'https://github.com/'.");
          }
        }
        
        if (pInfo.social) {
          if (typeof pInfo.social !== 'string' || (!pInfo.social.startsWith('https://linkedin.com/') && !pInfo.social.startsWith('https://www.linkedin.com/'))) {
            throw new Error("Erreur de format : personalInfo.social doit commencer par 'https://linkedin.com/' ou 'https://www.linkedin.com/'.");
          }
        }
      }

      // Arrays validation
      if (data.experiences && !Array.isArray(data.experiences)) throw new Error("Erreur de type : experiences doit être un tableau.");
      if (data.projects && !Array.isArray(data.projects)) throw new Error("Erreur de type : projects doit être un tableau.");
      if (data.education && !Array.isArray(data.education)) throw new Error("Erreur de type : education doit être un tableau.");
      if (data.skills && !Array.isArray(data.skills)) throw new Error("Erreur de type : skills doit être un tableau.");
      if (data.softSkills && !Array.isArray(data.softSkills)) throw new Error("Erreur de type : softSkills doit être un tableau.");
      if (data.languages && !Array.isArray(data.languages)) throw new Error("Erreur de type : languages doit être un tableau.");

      // Clear arrays
      this.experiences.clear();
      this.projects.clear();
      this.education.clear();
      this.skills.clear();
      this.softSkills.clear();
      this.languages.clear();

      // Repopulate arrays
      (data.experiences || []).forEach((exp: any) => {
        this.experiences.push(new FormGroup<ExperienceForm>({
          id: new FormControl<string | null>(exp.id || crypto.randomUUID()),
          company: new FormControl<string | null>(exp.company || ''),
          position: new FormControl<string | null>(exp.position || ''),
          startDate: new FormControl<string | null>(exp.startDate || ''),
          endDate: new FormControl<string | null>(exp.endDate || ''),
          description: new FormControl<string | null>(exp.description || '')
        }));
      });

      (data.projects || []).forEach((proj: any) => {
        this.projects.push(new FormGroup<ProjectForm>({
          id: new FormControl<string | null>(proj.id || crypto.randomUUID()),
          title: new FormControl<string | null>(proj.title || ''),
          technologies: new FormControl<string | null>(proj.technologies || ''),
          description: new FormControl<string | null>(proj.description || '')
        }));
      });

      (data.education || []).forEach((edu: any) => {
        this.education.push(new FormGroup<EducationForm>({
          id: new FormControl<string | null>(edu.id || crypto.randomUUID()),
          institution: new FormControl<string | null>(edu.institution || ''),
          degree: new FormControl<string | null>(edu.degree || ''),
          fieldOfStudy: new FormControl<string | null>(edu.fieldOfStudy || ''),
          graduationDate: new FormControl<string | null>(edu.graduationDate || '')
        }));
      });

      (data.skills || []).forEach((skill: any) => {
        this.skills.push(new FormGroup<SkillForm>({
          id: new FormControl<string | null>(skill.id || crypto.randomUUID()),
          name: new FormControl<string | null>(skill.name || ''),
          level: new FormControl<string | null>(skill.level || 'Beginner')
        }));
      });

      (data.softSkills || []).forEach((soft: any) => {
        this.softSkills.push(new FormGroup<SoftSkillForm>({
          id: new FormControl<string | null>(soft.id || crypto.randomUUID()),
          name: new FormControl<string | null>(soft.name || '')
        }));
      });

      (data.languages || []).forEach((lang: any) => {
        this.languages.push(new FormGroup<LanguageForm>({
          id: new FormControl<string | null>(lang.id || crypto.randomUUID()),
          name: new FormControl<string | null>(lang.name || ''),
          level: new FormControl<string | null>(lang.level || '')
        }));
      });

      // Patch value for the rest
      this.cvForm.patchValue({
        themeColor: data.themeColor || '#eab308',
        personalInfo: data.personalInfo || {}
      });

      this.jsonSuccess = true;
      setTimeout(() => {
        this.jsonSuccess = false;
      }, 4000);

    } catch (e: any) {
      this.jsonError = e.message || "Erreur lors du parsing JSON. Vérifiez la syntaxe.";
    }
  }

  // --- Experiences ---
  get experiences() {
    return this.cvForm.controls.experiences;
  }

  addExperience() {
    this.experiences.push(new FormGroup<ExperienceForm>({
      id: new FormControl<string | null>(crypto.randomUUID()),
      company: new FormControl<string | null>(''),
      position: new FormControl<string | null>(''),
      startDate: new FormControl<string | null>(''),
      endDate: new FormControl<string | null>(''),
      description: new FormControl<string | null>('')
    }));
  }

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  // --- Projects ---
  get projects() {
    return this.cvForm.controls.projects;
  }

  addProject() {
    this.projects.push(new FormGroup<ProjectForm>({
      id: new FormControl<string | null>(crypto.randomUUID()),
      title: new FormControl<string | null>(''),
      technologies: new FormControl<string | null>(''),
      description: new FormControl<string | null>('')
    }));
  }

  removeProject(index: number) {
    this.projects.removeAt(index);
  }

  // --- Education ---
  get education() {
    return this.cvForm.controls.education;
  }

  addEducation() {
    this.education.push(new FormGroup<EducationForm>({
      id: new FormControl<string | null>(crypto.randomUUID()),
      institution: new FormControl<string | null>(''),
      degree: new FormControl<string | null>(''),
      fieldOfStudy: new FormControl<string | null>(''),
      graduationDate: new FormControl<string | null>('')
    }));
  }

  removeEducation(index: number) {
    this.education.removeAt(index);
  }

  // --- Skills ---
  get skills() {
    return this.cvForm.controls.skills;
  }

  addSkill() {
    this.skills.push(new FormGroup<SkillForm>({
      id: new FormControl<string | null>(crypto.randomUUID()),
      name: new FormControl<string | null>(''),
      level: new FormControl<string | null>('Beginner')
    }));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  // --- Soft Skills ---
  get softSkills() {
    return this.cvForm.controls.softSkills;
  }

  addSoftSkill() {
    this.softSkills.push(new FormGroup<SoftSkillForm>({
      id: new FormControl<string | null>(crypto.randomUUID()),
      name: new FormControl<string | null>('')
    }));
  }

  removeSoftSkill(index: number) {
    this.softSkills.removeAt(index);
  }

  // --- Languages ---
  get languages() {
    return this.cvForm.controls.languages;
  }

  addLanguage() {
    this.languages.push(new FormGroup<LanguageForm>({
      id: new FormControl<string | null>(crypto.randomUUID()),
      name: new FormControl<string | null>(''),
      level: new FormControl<string | null>('')
    }));
  }

  removeLanguage(index: number) {
    this.languages.removeAt(index);
  }
}