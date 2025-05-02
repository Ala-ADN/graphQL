export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum MutationType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Skill {
  id: string;
  designation: string;
}

export interface Cv {
  id: string;
  name: string;
  age: number;
  job: string;
  userId: string;
  skillIds: string[];
}

export interface CvInput {
  name: string;
  age: number;
  job: string;
  userId: string;
  skillIds: string[];
}

export interface CvChange {
  mutation: MutationType;
  cv: Cv;
}
