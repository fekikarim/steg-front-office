/**
 * Typed backend candidate DTOs and server-side calls (contract: backend
 * `docs/openapi.json` — CandidateDetailResponse, CandidateRequest,
 * UniversityResponse). These run inside route handlers only: the browser talks
 * to `/api/profile`, which attaches the httpOnly session access token
 * server-side. Tokens and the candidate's national ID never reach client
 * bundles; the full CIN is returned to the candidate's own session (the
 * backend serves it to self only) and is held in memory by the profile UI,
 * never rendered unless the candidate explicitly reveals it.
 */
import {backendFetch} from '../api-client';

export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  speciality?: string | null;
  diploma?: string | null;
  skills?: string | null;
  languages?: string | null;
  nationalId: string;
  universityId: string;
  universityName?: string | null;
  userId: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  version?: number | null;
}

export interface CandidateProfileUpdate {
  email: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  universityId: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  speciality?: string | null;
  diploma?: string | null;
  skills?: string | null;
  languages?: string | null;
}

export interface University {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export function getMyCandidate(token: string) {
  return backendFetch<CandidateProfile>('/api/candidates/me', {method: 'GET', token});
}

export function updateMyCandidate(token: string, body: CandidateProfileUpdate) {
  return backendFetch<CandidateProfile>('/api/candidates/me', {method: 'PUT', token, body});
}

/** Public reference data: the list of active universities. */
export function listUniversities() {
  return backendFetch<University[]>('/api/universities', {method: 'GET'});
}