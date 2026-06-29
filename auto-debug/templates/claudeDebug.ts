/**
 * ⚠️ 此文件为 Claude auto-debug 临时文件，调试结束后会自动删除。
 * DO NOT EDIT — 你的修改将在清理时丢失。
 */

const DEBUG_ID = '{{DEBUG_ID}}';
const ENDPOINT = '{{ENDPOINT}}';

function getCallerInfo(): string {
  try {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    const lines = stack.split('\n');
    // 跳过 Error、dbg、getCallerInfo 三层
    const caller = lines[3] || lines[lines.length - 1];
    const match = caller?.match(/\((.+?):(\d+):(\d+)\)/);
    if (match) {
      const fullPath = match[1];
      const srcIdx = fullPath.indexOf('/src/');
      const shortPath = srcIdx >= 0 ? fullPath.slice(srcIdx + 1) : fullPath.split('/').pop() || fullPath;
      return `${shortPath}:${match[2]}`;
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

function safeStringify(data: any): string {
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

export function dbg(label: string, data?: any): void {
  const entry: Record<string, any> = {
    id: DEBUG_ID,
    ts: Date.now(),
    label,
    file: getCallerInfo(),
  };

  if (data !== undefined) {
    entry.data = typeof data === 'string' ? data : safeStringify(data);
  }

  try {
    fetch(`${ENDPOINT}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      // 静默失败，不影响业务
    });
  } catch {
    // 静默失败
  }
}
