import { computed, Injectable, signal } from '@angular/core';
import { CvData } from '../../models/cv';
import { Experience } from '../../models/experience';
import { PersonalInfo } from '../../models/personal-info';
import { Project } from '../../models/project';
import { Education } from '../../models/education';
import { Skill, SoftSkill } from '../../models/skill';
import { Language } from '../../models/language';

@Injectable({
  providedIn: 'root',
})
export class CvStateService {
  private state = signal<CvData>({
    themeColor: '#082ee7',
    personalInfo: {
      fullName: '',
      jobTitle: '',
      subtitle: '',
      photoUrl: '',
      age: null,
      email: '',
      phonePrefix: 'FR',
      phone: '',
      github: '',
      social: '',
      summary: ''
    },
    experiences: [],
    projects: [],
    education: [],
    skills: [],
    softSkills: [],
    languages: []
  });

  readonly cvData = this.state.asReadonly();

  readonly themeColor = computed(() => this.state().themeColor);
  readonly personalInfo = computed(() => this.state().personalInfo);
  readonly experiences = computed(() => this.state().experiences);
  readonly projects = computed(() => this.state().projects);
  readonly education = computed(() => this.state().education);
  readonly skills = computed(() => this.state().skills);
  readonly softSkills = computed(() => this.state().softSkills);
  readonly languages = computed(() => this.state().languages);

  updateThemeColor(color: string) {
    this.state.update(current => ({ ...current, themeColor: color }));
  }

  updatePersonalInfo(info: Partial<PersonalInfo>) {
    this.state.update(current => ({
      ...current,
      personalInfo: { ...current.personalInfo, ...info }
    }));
  }

  setExperiences(experiences: Experience[]) {
    this.state.update(current => ({ ...current, experiences }));
  }

  setProjects(projects: Project[]) {
    this.state.update(current => ({ ...current, projects }));
  }

  setEducation(education: Education[]) {
    this.state.update(current => ({ ...current, education }));
  }

  setSkills(skills: Skill[]) {
    this.state.update(current => ({ ...current, skills }));
  }

  setSoftSkills(softSkills: SoftSkill[]) {
    this.state.update(current => ({ ...current, softSkills }));
  }

  setLanguages(languages: Language[]) {
    this.state.update(current => ({ ...current, languages }));
  }
}
