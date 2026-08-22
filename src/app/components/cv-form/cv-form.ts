import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormArray, FormControl, Validators } from '@angular/forms';
import { CvStateService } from '../../services/cv-state/cv-state-service';
import { Subject, takeUntil } from 'rxjs';
import { AsYouType, CountryCode, getCountries, getCountryCallingCode, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { FillOnTab } from '../../directives/fill-on-tab';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { cvForm, DEFAULT_JSON_TEMPLATE } from '../../data/cv-form';
import { PersonalInfoForm } from '../../models/personal-info';
import { CvFormModel } from '../../models/cv';
import { ExperienceForm } from '../../models/experience';
import { ProjectForm } from '../../models/project';
import { EducationForm } from '../../models/education';
import { SkillForm, SoftSkillForm } from '../../models/skill';
import { LanguageForm } from '../../models/language';
import { syntaxHighlight, parseAndValidateJson, populateFormArrays } from '../../utils/cv-json';


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
  jsonPanelOpen = false;

  private sanitizer = inject(DomSanitizer);
  jsonValue = toSignal(this.jsonInputControl.valueChanges, { initialValue: this.jsonInputControl.value || '' });

  highlightedJson = computed(() => {
    const json = this.jsonValue() || '';
    if (!json) return '';
    return this.sanitizer.bypassSecurityTrustHtml(syntaxHighlight(json));
  });

  onJsonScroll(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const pre = textarea.previousElementSibling as HTMLElement;
    if (pre) {
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    }
  }

  DEFAULT_JSON_TEMPLATE = DEFAULT_JSON_TEMPLATE;

  cvForm = cvForm;

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

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.cvForm.controls.personalInfo.controls.photoUrl.setValue(reader.result as string);
      };
      reader.readAsDataURL(file);
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

    const validCountryCodes = this.countries.map(c => c.code);
    const result = parseAndValidateJson(jsonString, validCountryCodes);

    if (!result.success) {
      this.jsonError = result.error || "Erreur inconnue.";
      return;
    }

    // Populate arrays
    populateFormArrays(this.cvForm, result.data);

    // Patch value for the rest
    this.cvForm.patchValue({
      themeColor: result.data.themeColor || '#082ee7',
      personalInfo: result.data.personalInfo || {}
    });

    this.jsonSuccess = true;
    setTimeout(() => {
      this.jsonSuccess = false;
    }, 4000);
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