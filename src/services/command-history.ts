/**
 * CommandHistory
 *
 * Layer:
 *   Workspace Architecture — Undo/Redo System
 *
 * Owns:
 *   Command stack, undo/redo execution
 *   Separate from Timeline (which is for audit log)
 *
 * Never owns:
 *   Document state (mutates through provided callbacks)
 *
 * Communication:
 *   Emits events via WorkspaceEventBus
 */

import type { WorkspaceEventBus } from './workspace-event-bus';

export interface Command {
  id: string;
  type: string;
  timestamp: number;
  description: string;
  buildId: string;
  forward: () => void;
  inverse: () => void;
}

export class CommandHistory {
  private stack: Command[] = [];
  private index: number = -1;
  private maxHistory: number = 200;
  private eventBus: WorkspaceEventBus;

  constructor(eventBus: WorkspaceEventBus) {
    this.eventBus = eventBus;
  }

  execute(command: Command): void {
    // Clear any redo history beyond current index
    this.stack = this.stack.slice(0, this.index + 1);
    this.stack.push(command);
    if (this.stack.length > this.maxHistory) {
      this.stack.shift();
    }
    this.index = this.stack.length - 1;
    command.forward();
    this.eventBus.emit('command-executed', 'CommandHistory', {
      type: command.type,
      description: command.description,
      buildId: command.buildId,
    });
  }

  undo(): Command | null {
    if (this.index < 0 || this.index >= this.stack.length) return null;
    const command = this.stack[this.index];
    command.inverse();
    this.index--;
    this.eventBus.emit('undone', 'CommandHistory', { description: command.description });
    return command;
  }

  redo(): Command | null {
    if (this.index + 1 >= this.stack.length) return null;
    const command = this.stack[this.index + 1];
    command.forward();
    this.index++;
    this.eventBus.emit('redone', 'CommandHistory', { description: command.description });
    return command;
  }

  canUndo(): boolean {
    return this.index >= 0;
  }

  canRedo(): boolean {
    return this.index + 1 < this.stack.length;
  }

  getHistory(): Command[] {
    return [...this.stack];
  }

  clear(buildId?: string): void {
    if (buildId) {
      this.stack = this.stack.filter(c => c.buildId !== buildId);
      this.index = Math.min(this.index, this.stack.length - 1);
    } else {
      this.stack = [];
      this.index = -1;
    }
  }

  destroy(): void {
    this.stack = [];
    this.index = -1;
  }
}
