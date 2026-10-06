"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  DraftPhoto,
  DraftPhotos,
  ParticipantInfo,
  ScanView,
} from "@/lib/types/scan";
import { SCAN_VIEWS } from "@/lib/types/scan";

interface ScanDraftContextValue {
  participant: ParticipantInfo | null;
  setParticipant: (info: ParticipantInfo) => void;
  photos: DraftPhotos;
  setPhoto: (photo: DraftPhoto) => void;
  clearPhoto: (view: ScanView) => void;
  hasAllPhotos: boolean;
  resetDraft: () => void;
}

const ScanDraftContext = createContext<ScanDraftContextValue | null>(null);

const PARTICIPANT_KEY = "bma.scan.participant";

function readStoredParticipant(): ParticipantInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PARTICIPANT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ParticipantInfo;
  } catch {
    return null;
  }
}

export function ScanDraftProvider({ children }: { children: ReactNode }) {
  const [participant, setParticipantState] = useState<ParticipantInfo | null>(readStoredParticipant);
  const [photos, setPhotos] = useState<DraftPhotos>({});

  const setParticipant = useCallback((info: ParticipantInfo) => {
    setParticipantState(info);
    try {
      sessionStorage.setItem(PARTICIPANT_KEY, JSON.stringify(info));
    } catch {
      // Private mode / quota — in-memory still works for the session
    }
  }, []);

  const setPhoto = useCallback((photo: DraftPhoto) => {
    setPhotos((current) => {
      const previous = current[photo.view];
      if (previous?.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      return { ...current, [photo.view]: photo };
    });
  }, []);

  const clearPhoto = useCallback((view: ScanView) => {
    setPhotos((current) => {
      const previous = current[view];
      if (previous?.previewUrl) {
        URL.revokeObjectURL(previous.previewUrl);
      }
      const next = { ...current };
      delete next[view];
      return next;
    });
  }, []);

  const resetDraft = useCallback(() => {
    setPhotos((current) => {
      for (const view of SCAN_VIEWS) {
        const photo = current[view];
        if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      }
      return {};
    });
    setParticipantState(null);
    try {
      sessionStorage.removeItem(PARTICIPANT_KEY);
    } catch {
      // ignore
    }
  }, []);

  const hasAllPhotos = SCAN_VIEWS.every((view) => Boolean(photos[view]));

  const value = useMemo(
    () => ({
      participant,
      setParticipant,
      photos,
      setPhoto,
      clearPhoto,
      hasAllPhotos,
      resetDraft,
    }),
    [participant, setParticipant, photos, setPhoto, clearPhoto, hasAllPhotos, resetDraft],
  );

  return <ScanDraftContext.Provider value={value}>{children}</ScanDraftContext.Provider>;
}

export function useScanDraft(): ScanDraftContextValue {
  const context = useContext(ScanDraftContext);
  if (!context) {
    throw new Error("useScanDraft must be used within ScanDraftProvider");
  }
  return context;
}
