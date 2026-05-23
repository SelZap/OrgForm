/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  CREATOR = "CREATOR",         // Form Creator
  FACILITATOR = "FACILITATOR", // Form Facilitator
  LEAD = "LEAD",               // Lead Member
}

export enum PostCategory {
  Announcement = "Announcement",
  Proposal = "Proposal",
  Sponsorship = "Sponsorship",
  Advocate = "Advocate",
  Suggestion = "Suggestion",
  Opinion = "Opinion",
  Survey = "Survey",
}

export enum FormStatus {
  DRAFT = "DRAFT",
  REVIEW_PENDING = "REVIEW_PENDING",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
  REVISION_PENDING = "REVISION_PENDING",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "ACTIVE" | "PENDING";
}

export interface OrganizationInfo {
  id: string;
  name: string;
  fbPageId: string;
  fbAccessToken: string;
  emailApiKey: string;
  senderEmail: string;
}

export interface FormEditHistory {
  id: string;
  timestamp: string;
  memberId: string;
  memberName: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface FormComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  timestamp: string;
}

export interface FormField {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select" | "number";
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  creatorId: string;
  creatorName: string;
  isPublic: boolean;
  socialMediaCaption?: string;
  fields: FormField[];
  comments: FormComment[];
  editHistory: FormEditHistory[];
  collaborators: string[]; // User IDs of other Form Creators invited
  facebookPostId?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  authorId: string;
  authorName: string;
  authorRole: Role;
  createdAt: string;
  attachedFormId?: string; // Standard or proposal forms attached
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
  respondentEmail?: string;
}

export interface FormSpecificAnnouncement {
  id: string;
  formId: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

export interface Subscriber {
  id: string;
  formId: string;
  email: string;
  createdAt: string;
}

export interface SystemState {
  users: User[];
  orgInfo: OrganizationInfo;
  forms: FormTemplate[];
  posts: Post[];
  responses: FormResponse[];
  formAnnouncements: FormSpecificAnnouncement[];
  subscribers: Subscriber[];
}
