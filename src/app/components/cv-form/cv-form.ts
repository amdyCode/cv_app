import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CvStateService } from '../../services/cv-state-service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cv-form',
  imports: [ReactiveFormsModule],
  templateUrl: './cv-form.html',
  styleUrls: ['./cv-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CvForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cvState = inject(CvStateService);
  private destroy$ = new Subject<void>();

  cvForm = this.fb.group({
    themeColor: ['#eab308'],
    personalInfo: this.fb.group({
      fullName: [''],
      jobTitle: [''],
      subtitle: [''],
      photoUrl: [''],
      age: [''],
      email: [''],
      phone: [''],
      location: [''],
      github: [''],
      social: [''],
      summary: ['']
    }),
    experiences: this.fb.array([]),
    projects: this.fb.array([]),
    education: this.fb.array([]),
    skills: this.fb.array([]),
    softSkills: this.fb.array([]),
    languages: this.fb.array([])
  });

  ngOnInit() {
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

  // --- Experiences ---
  get experiences() {
    return this.cvForm.get('experiences') as FormArray;
  }

  addExperience() {
    this.experiences.push(this.fb.group({
      id: [crypto.randomUUID()],
      company: [''],
      position: [''],
      startDate: [''],
      endDate: [''],
      description: ['']
    }));
  }

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  // --- Projects ---
  get projects() {
    return this.cvForm.get('projects') as FormArray;
  }

  addProject() {
    this.projects.push(this.fb.group({
      id: [crypto.randomUUID()],
      title: [''],
      technologies: [''],
      description: ['']
    }));
  }

  removeProject(index: number) {
    this.projects.removeAt(index);
  }

  // --- Education ---
  get education() {
    return this.cvForm.get('education') as FormArray;
  }

  addEducation() {
    this.education.push(this.fb.group({
      id: [crypto.randomUUID()],
      institution: [''],
      degree: [''],
      fieldOfStudy: [''],
      graduationDate: ['']
    }));
  }

  removeEducation(index: number) {
    this.education.removeAt(index);
  }

  // --- Skills ---
  get skills() {
    return this.cvForm.get('skills') as FormArray;
  }

  addSkill() {
    this.skills.push(this.fb.group({
      id: [crypto.randomUUID()],
      name: [''],
      level: ['Beginner']
    }));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  // --- Soft Skills ---
  get softSkills() {
    return this.cvForm.get('softSkills') as FormArray;
  }

  addSoftSkill() {
    this.softSkills.push(this.fb.group({
      id: [crypto.randomUUID()],
      name: ['']
    }));
  }

  removeSoftSkill(index: number) {
    this.softSkills.removeAt(index);
  }

  // --- Languages ---
  get languages() {
    return this.cvForm.get('languages') as FormArray;
  }

  addLanguage() {
    this.languages.push(this.fb.group({
      id: [crypto.randomUUID()],
      name: [''],
      level: ['']
    }));
  }

  removeLanguage(index: number) {
    this.languages.removeAt(index);
  }
}