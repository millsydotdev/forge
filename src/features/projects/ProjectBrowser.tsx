import { useState, useMemo, useCallback } from 'react';
import { workspaceManager } from '../../services/workspace-manager';


type ViewMode = 'grid' | 'list';
type SortMode = 'name' | 'created' | 'updated' | 'builds';

export function ProjectBrowser({ onSelectProject }: { onSelectProject?: (id: string) => void }) {
  const [projects, setProjects] = useState(() => workspaceManager.projects.getAll());
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'archived'>('active');

  // Refresh from event bus
  useState(() => {
    const unsub = workspaceManager.events.on('project-created', () => {
      setProjects(workspaceManager.projects.getAll());
    });
    const unsub2 = workspaceManager.events.on('project-deleted', () => {
      setProjects(workspaceManager.projects.getAll());
    });
    return () => { unsub(); unsub2(); };
  });

  const filtered = useMemo(() => {
    let list = [...projects];

    // Filter
    if (filterMode === 'active') list = list.filter(p => !p.archived);
    else if (filterMode === 'archived') list = list.filter(p => p.archived);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }

    // Sort
    list.sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      if (sortMode === 'created') return b.createdAt - a.createdAt;
      if (sortMode === 'builds') return b.buildIds.length - a.buildIds.length;
      return b.updatedAt - a.updatedAt; // default: updated
    });

    return list;
  }, [projects, search, filterMode, sortMode]);

  const handleCreate = useCallback(() => {
    const name = prompt('Project name:');
    if (name) {
      workspaceManager.projects.create(name);
      setProjects(workspaceManager.projects.getAll());
    }
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (confirm('Delete this project and all its builds?')) {
      workspaceManager.projects.delete(id);
      setProjects(workspaceManager.projects.getAll());
    }
  }, []);

  const togglePin = useCallback((id: string) => {
    workspaceManager.projects.togglePin(id);
    setProjects(workspaceManager.projects.getAll());
  }, []);

  const toggleArchive = useCallback((id: string) => {
    workspaceManager.projects.toggleArchive(id);
    setProjects(workspaceManager.projects.getAll());
  }, []);

  return (
    <div className="project-browser">
      <div className="project-browser__header">
        <span className="project-browser__title">Projects</span>
        <button className="project-browser__new-btn" onClick={handleCreate}>+ New</button>
      </div>

      <div className="project-browser__toolbar">
        <input
          type="text"
          className="project-browser__search"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="project-browser__filter" value={filterMode} onChange={e => setFilterMode(e.target.value as any)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select className="project-browser__sort" value={sortMode} onChange={e => setSortMode(e.target.value as any)}>
          <option value="updated">Last Updated</option>
          <option value="name">Name</option>
          <option value="created">Created</option>
          <option value="builds">Build Count</option>
        </select>
        <div className="project-browser__view-toggle">
          <button className={`project-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>▦</button>
          <button className={`project-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>≡</button>
        </div>
      </div>

      <div className={`project-browser__body project-browser__body--${viewMode}`}>
        {filtered.length === 0 && (
          <div className="project-browser__empty">
            {search ? 'No projects match your search.' : 'No projects yet. Create one to get started.'}
          </div>
        )}
        {filtered.map(project => (
          viewMode === 'grid' ? (
            <div
              key={project.id}
              className={`project-card ${project.pinned ? 'project-card--pinned' : ''} ${project.archived ? 'project-card--archived' : ''}`}
              onClick={() => onSelectProject?.(project.id)}
            >
              <div className="project-card__icon">{project.name[0].toUpperCase()}</div>
              <div className="project-card__name">{project.name}</div>
              <div className="project-card__meta">{project.buildIds.length} builds</div>
              <div className="project-card__actions">
                {!project.archived && <button className="project-card__action" onClick={e => { e.stopPropagation(); togglePin(project.id); }} title={project.pinned ? 'Unpin' : 'Pin'}>{project.pinned ? '★' : '☆'}</button>}
                <button className="project-card__action" onClick={e => { e.stopPropagation(); toggleArchive(project.id); }} title={project.archived ? 'Unarchive' : 'Archive'}>📁</button>
                <button className="project-card__action project-card__action--danger" onClick={e => { e.stopPropagation(); handleDelete(project.id); }} title="Delete">✕</button>
              </div>
            </div>
          ) : (
            <div
              key={project.id}
              className={`project-row ${project.pinned ? 'project-row--pinned' : ''} ${project.archived ? 'project-row--archived' : ''}`}
              onClick={() => onSelectProject?.(project.id)}
            >
              <span className="project-row__name">{project.pinned ? '★ ' : ''}{project.name}</span>
              <span className="project-row__meta">{project.buildIds.length} builds</span>
              <span className="project-row__date">{new Date(project.updatedAt).toLocaleDateString()}</span>
              <span className="project-row__actions">
                <button onClick={e => { e.stopPropagation(); toggleArchive(project.id); }}>{project.archived ? 'Restore' : 'Archive'}</button>
                <button onClick={e => { e.stopPropagation(); handleDelete(project.id); }}>Delete</button>
              </span>
            </div>
          )
        ))}
      </div>

      <div className="project-browser__status">
        {filtered.length} project{filtered.length !== 1 ? 's' : ''} · {projects.filter(p => !p.archived).length} active · {projects.filter(p => p.archived).length} archived
      </div>
    </div>
  );
}
