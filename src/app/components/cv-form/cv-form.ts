import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { CvStateService } from '../../services/cv-state-service';
import { Subject, takeUntil } from 'rxjs';
import { getCountries, getCountryCallingCode, getExampleNumber, isValidPhoneNumber, AsYouType, CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

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
  imports: [ReactiveFormsModule],
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
      github: new FormControl<string | null>(''),
      social: new FormControl<string | null>(''),
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