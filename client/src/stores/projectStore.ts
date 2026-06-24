import { create } from 'zustand';
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types';
import { get, post, patch, del } from '@/lib/api';

/**
 * 项目状态 Store
 *
 * 管理项目列表、当前项目、加载状态和错误信息。
 * 提供项目 CRUD 操作和状态过滤功能。
 */

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: (status?: string) => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: number, data: UpdateProjectRequest) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async (status?: string) => {
    set({ loading: true, error: null });
    try {
      const url = status
        ? `/api/projects?status=${encodeURIComponent(status)}`
        : '/api/projects';
      const projects = await get<Project[]>(url);
      set({ projects, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchProject: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const project = await get<Project>(`/api/projects/${id}`);
      set({ currentProject: project, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createProject: async (data: CreateProjectRequest) => {
    set({ loading: true, error: null });
    try {
      const project = await post<Project>('/api/projects', data);
      set((state) => ({
        projects: [project, ...state.projects],
        loading: false,
      }));
      return project;
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  updateProject: async (id: number, data: UpdateProjectRequest) => {
    set({ loading: true, error: null });
    try {
      const updated = await patch<Project>(`/api/projects/${id}`, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        currentProject:
          state.currentProject?.id === id ? updated : state.currentProject,
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  deleteProject: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await del(`/api/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
        loading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },
}));
