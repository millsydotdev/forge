import { create } from 'zustand';
import { Brand } from '../services/visual-manager';
import { logger } from '../utils/logger';

const STORAGE_KEY = Brand.getStorageKey('projects');

export interface ProjectVariant {
  id: string;
  name: string;
  buildCode: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  variants: ProjectVariant[];
  currentVariantId: string | null;
}

interface PersistedState {
  projects: Project[];
  currentProjectId: string | null;
}

export interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  loading: boolean;
}

export interface ProjectActions {
  setProjects: (projects: Project[]) => void;
  setCurrentProjectId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;

  createProject: (name: string, description?: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  addVariant: (projectId: string, name: string, buildCode: string) => Promise<string>;
  deleteVariant: (projectId: string, variantId: string) => Promise<void>;
  setCurrentVariant: (projectId: string, variantId: string) => Promise<void>;
}

function persist(data: PersistedState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { logger.warn('[ProjectStore] persist failed:', e); }
}

function loadPersisted(): { projects: Project[]; currentProjectId: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { logger.warn('[ProjectStore] load failed:', e); }
  return { projects: [], currentProjectId: null };
}

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
  ...loadPersisted(),
  loading: false,

  setProjects: (projects) => set((s) => {
    const next = { ...s, projects };
    persist(next);
    return next;
  }),
  setCurrentProjectId: (currentProjectId) => set((s) => {
    const next = { ...s, currentProjectId };
    persist(next);
    return next;
  }),
  setLoading: (loading) => set({ loading }),

  createProject: async (name, description = '') => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const project: Project = {
      id, name, description,
      createdAt: now, updatedAt: now,
      variants: [],
      currentVariantId: null,
    };
    set((s) => {
      const next = { ...s, projects: [...s.projects, project], currentProjectId: id };
      persist(next);
      return next;
    });
    return id;
  },

  deleteProject: async (id) => {
    set((s) => {
      const next = {
        ...s,
        projects: s.projects.filter((p) => p.id !== id),
        currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
      };
      persist(next);
      return next;
    });
  },

  renameProject: async (id, name) => {
    set((s) => {
      const next = {
        ...s,
        projects: s.projects.map((p) => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p)),
      };
      persist(next);
      return next;
    });
  },

  addVariant: async (projectId, name, buildCode) => {
    const variantId = crypto.randomUUID();
    const now = Date.now();
    set((s) => {
      const next = {
        ...s,
        projects: s.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                updatedAt: now,
                currentVariantId: variantId,
                variants: [...p.variants, { id: variantId, name, buildCode, notes: '', createdAt: now, updatedAt: now }],
              }
            : p
        ),
      };
      persist(next);
      return next;
    });
    return variantId;
  },

  deleteVariant: async (projectId, variantId) => {
    set((s) => {
      const next = {
        ...s,
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, updatedAt: Date.now(), variants: p.variants.filter((v) => v.id !== variantId), currentVariantId: p.currentVariantId === variantId ? null : p.currentVariantId }
            : p
        ),
      };
      persist(next);
      return next;
    });
  },

  setCurrentVariant: async (projectId, variantId) => {
    set((s) => {
      const next = {
        ...s,
        projects: s.projects.map((p) => (p.id === projectId ? { ...p, currentVariantId: variantId } : p)),
      };
      persist(next);
      return next;
    });
  },
}));
