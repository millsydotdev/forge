/**
 * ProjectManager
 *
 * Layer:
 *   Workspace Architecture — Project Hierarchy
 *
 * Owns:
 *   Projects, project/build relationships, project metadata
 *
 * Never owns:
 *   Build documents (delegates to DocumentManager)
 *   Storage (delegates to WorkspaceStorage)
 *
 * Communication:
 *   Emits events via WorkspaceEventBus
 */

import type { WorkspaceEventBus } from './workspace-event-bus';

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  buildIds: string[];   // ordered list of build IDs
  workspaceVersion: number;
  projectVersion: number;
}

export class ProjectManager {
  private projects: Project[] = [];
  private eventBus: WorkspaceEventBus;

  constructor(eventBus: WorkspaceEventBus) {
    this.eventBus = eventBus;
  }

  getAll(): Project[] {
    return [...this.projects];
  }

  get(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  create(name: string, description = ''): Project {
    const now = Date.now();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
    const project: Project = {
      id: crypto.randomUUID(),
      slug,
      name,
      description,
      tags: [],
      pinned: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
      buildIds: [],
      workspaceVersion: 1,
      projectVersion: 1,
    };
    this.projects.push(project);
    this.eventBus.emit('project-created', 'ProjectManager', { projectId: project.id, name });
    return project;
  }

  delete(id: string): void {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.projects.splice(idx, 1);
      this.eventBus.emit('project-deleted', 'ProjectManager', { projectId: id });
    }
  }

  rename(id: string, name: string): void {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      project.name = name;
      project.updatedAt = Date.now();
    }
  }

  addBuild(projectId: string, buildId: string): void {
    const project = this.projects.find(p => p.id === projectId);
    if (project && !project.buildIds.includes(buildId)) {
      project.buildIds.push(buildId);
      project.updatedAt = Date.now();
    }
  }

  removeBuild(projectId: string, buildId: string): void {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.buildIds = project.buildIds.filter(id => id !== buildId);
      project.updatedAt = Date.now();
    }
  }

  togglePin(id: string): void {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      project.pinned = !project.pinned;
      project.updatedAt = Date.now();
    }
  }

  toggleArchive(id: string): void {
    const project = this.projects.find(p => p.id === id);
    if (project) {
      project.archived = !project.archived;
      project.updatedAt = Date.now();
    }
  }

  getPinned(): Project[] {
    return this.projects.filter(p => p.pinned && !p.archived);
  }

  getActive(): Project[] {
    return this.projects.filter(p => !p.archived);
  }

  getArchived(): Project[] {
    return this.projects.filter(p => p.archived);
  }

  toData(): Project[] {
    return [...this.projects];
  }

  loadFromData(data: Project[]): void {
    this.projects = data;
  }

  destroy(): void {
    this.projects = [];
  }
}
