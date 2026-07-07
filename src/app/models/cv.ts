import { Education } from "./education";
import { Experience } from "./experience";
import { Language } from "./language";
import { PersonalInfo } from "./personal-info";
import { Project } from "./project";
import { Skill, SoftSkill } from "./skill";

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