import { useAuth } from '@/context/authcontext';
import {
  createPrescription,
  deletePrescription,
  listPrescriptions,
  updatePrescription,
} from '@/services/prescriptions.services';
import { isDuplicate } from '@/my-health/prescriptions/state/prescriptions.mapper';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { medicationReady, type Medication, type MedicationDraft } from './model';

// The session boundary loads the list before any screen mounts, so the list is correct on the first
// render and a failed load shows the boundary's retry screen instead of "Prescription list is empty".
let preloaded: { userId: string; list: Medication[] } | null = null;
// Bumped on every clear, so a request that started for a previous account cannot land late and
// overwrite the list loaded for the current one.
let generation = 0;

/** Loads this account's prescriptions. Called by the session boundary - throws if the request fails. */
export async function loadPrescriptions(userId: string) {
  const requestGeneration = generation;
  const list = await listPrescriptions(userId);
  if (requestGeneration !== generation) return;
  preloaded = { userId, list };
}

/** Forgets the loaded list when the account changes or the boundary unmounts. */
export function clearPrescriptions() {
  generation += 1;
  preloaded = null;
}
