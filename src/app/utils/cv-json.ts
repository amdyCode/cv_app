import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { AsYouType, CountryCode } from 'libphonenumber-js';
import { CvFormModel } from '../models/cv';
import { ExperienceForm } from '../models/experience';
import { ProjectForm } from '../models/project';
import { EducationForm } from '../models/education';
import { SkillForm, SoftSkillForm } from '../models/skill';
import { LanguageForm } from '../models/language';

export function isValidDate(value: string): boolean {
  if (typeof value !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function syntaxHighlight(json: string): string {
  let html = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return html.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\]:,])/g, (match) => {
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        return '<span class="json-key">' + match.substring(0, match.length - 1) + '</span><span class="json-punctuation">:</span>';
      } else {
        return '<span class="json-string">' + match + '</span>';
      }
    } else if (/true|false/.test(match)) {
      return '<span class="json-boolean">' + match + '</span>';
    } else if (/null/.test(match)) {
      return '<span class="json-null">' + match + '</span>';
    } else if (/[{}[\]]/.test(match)) {
      return '<span class="json-bracket">' + match + '</span>';
    } else if (/[:,]/.test(match)) {
      return '<span class="json-punctuation">' + match + '</span>';
    }
    return '<span class="json-number">' + match + '</span>';
  });
}

export function parseAndValidateJson(jsonString: string, validCountryCodes: string[]): { success: boolean; data?: any; error?: string } {
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
        if (!validCountryCodes.includes(pInfo.phonePrefix)) {
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

    // Date validation for experiences
    (data.experiences || []).forEach((exp: any, i: number) => {
      if (exp.startDate && !isValidDate(exp.startDate)) {
        throw new Error(`Format attendu : AAAA-MM-JJ (ex: 2020-01-15).`);
      }
      if (exp.endDate && !isValidDate(exp.endDate)) {
        throw new Error(`Format attendu : AAAA-MM-JJ (ex: 2024-06-30).`);
      }
    });

    // Date validation for education
    (data.education || []).forEach((edu: any, i: number) => {
      if (edu.graduationDate && !isValidDate(edu.graduationDate)) {
        throw new Error(`Format attendu : AAAA-MM-JJ (ex: 2019-06-30).`);
      }
    });

    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message || "Erreur lors du parsing JSON. Vérifiez la syntaxe." };
  }
}

export function populateFormArrays(cvForm: FormGroup<CvFormModel>, data: any) {
  const experiences = cvForm.controls.experiences;
  const projects = cvForm.controls.projects;
  const education = cvForm.controls.education;
  const skills = cvForm.controls.skills;
  const softSkills = cvForm.controls.softSkills;
  const languages = cvForm.controls.languages;

  experiences.clear();
  projects.clear();
  education.clear();
  skills.clear();
  softSkills.clear();
  languages.clear();

  (data.experiences || []).forEach((exp: any) => {
    experiences.push(new FormGroup<ExperienceForm>({
      id: new FormControl<string | null>(exp.id || crypto.randomUUID()),
      company: new FormControl<string | null>(exp.company || ''),
      position: new FormControl<string | null>(exp.position || ''),
      startDate: new FormControl<string | null>(exp.startDate || ''),
      endDate: new FormControl<string | null>(exp.endDate || ''),
      description: new FormControl<string | null>(exp.description || '')
    }));
  });

  (data.projects || []).forEach((proj: any) => {
    if (proj.link !== undefined && proj.link !== null && proj.link !== '') {
    if (typeof proj.link !== 'string') {
      throw new Error(`Erreur de type : projects[].link doit être du texte (ex: "${proj.title || 'un projet'}").`);
    }
    // Format souple : http(s):// obligatoire si renseigné, pas de domaine imposé
    if (!/^https?:\/\/.+/.test(proj.link)) {
      throw new Error(`Erreur de format : le lien du projet "${proj.title || ''}" doit commencer par http:// ou https://.`);
    }
  }
    projects.push(new FormGroup<ProjectForm>({
      id: new FormControl<string | null>(proj.id || crypto.randomUUID()),
      title: new FormControl<string | null>(proj.title || ''),
      technologies: new FormControl<string | null>(proj.technologies || ''),
      description: new FormControl<string | null>(proj.description || ''),
      link: new FormControl<string | null>(proj.link || '')
    }));
  });

  (data.education || []).forEach((edu: any) => {
    education.push(new FormGroup<EducationForm>({
      id: new FormControl<string | null>(edu.id || crypto.randomUUID()),
      institution: new FormControl<string | null>(edu.institution || ''),
      degree: new FormControl<string | null>(edu.degree || ''),
      fieldOfStudy: new FormControl<string | null>(edu.fieldOfStudy || ''),
      graduationDate: new FormControl<string | null>(edu.graduationDate || '')
    }));
  });

  (data.skills || []).forEach((skill: any) => {
    skills.push(new FormGroup<SkillForm>({
      id: new FormControl<string | null>(skill.id || crypto.randomUUID()),
      name: new FormControl<string | null>(skill.name || ''),
      level: new FormControl<string | null>(skill.level || 'Beginner')
    }));
  });

  (data.softSkills || []).forEach((soft: any) => {
    softSkills.push(new FormGroup<SoftSkillForm>({
      id: new FormControl<string | null>(soft.id || crypto.randomUUID()),
      name: new FormControl<string | null>(soft.name || '')
    }));
  });

  (data.languages || []).forEach((lang: any) => {
    languages.push(new FormGroup<LanguageForm>({
      id: new FormControl<string | null>(lang.id || crypto.randomUUID()),
      name: new FormControl<string | null>(lang.name || ''),
      level: new FormControl<string | null>(lang.level || '')
    }));
  });
}
