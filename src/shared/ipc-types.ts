export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ipcOk<T>(data: T): IpcResult<T> {
  return { ok: true, data };
}

export function ipcErr<T>(error: unknown): IpcResult<T> {
  const message = error instanceof Error ? error.message : String(error);
  return { ok: false, error: message };
}
