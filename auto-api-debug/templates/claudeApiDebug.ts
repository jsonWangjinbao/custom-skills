/**
 * ⚠️ 此文件为 Claude auto-api-debug 临时文件，联调结束后会自动删除。
 * DO NOT EDIT — 你的修改将在清理时丢失。
 */

const DEBUG_ID = '{{DEBUG_ID}}';
const ENDPOINT = '{{ENDPOINT}}';

function getCallerInfo(): string {
  try {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    const lines = stack.split('\n');
    // 跳过 Error、getCallerInfo、send、apiDbg 四层，取业务调用位置
    const caller = lines[4] || lines[lines.length - 1];
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

function serializeError(err: any): Record<string, any> {
  if (!err) return { message: 'unknown error' };
  const out: Record<string, any> = {
    message: err.message || String(err),
  };
  // 尽量提取 HTTP 状态码与业务错误体（兼容 axios / 各类 request 封装）
  const status = err.status ?? err.response?.status;
  if (status !== undefined) out.status = status;
  const code = err.code ?? err.response?.data?.code;
  if (code !== undefined) out.code = code;
  const body = err.response?.data;
  if (body !== undefined) out.body = body;
  return out;
}

function send(label: string, payload: Record<string, any>): void {
  const entry = {
    id: DEBUG_ID,
    ts: Date.now(),
    label,
    file: getCallerInfo(),
    data: safeStringify(payload),
  };

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

/**
 * 接口出入参日志包装器。
 * label 格式：`{METHOD} {url}`，如 'POST /order/submit'，必须与 inventory 中一致。
 * 自动记录 request / response + 耗时；出错记录 error 后原样 rethrow，不改变业务行为。
 */
export async function apiDbg<T>(label: string, params: any, fn: () => Promise<T>): Promise<T> {
  send(label, { type: 'request', params });
  const start = Date.now();
  try {
    const res = await fn();
    send(label, { type: 'response', response: res, durationMs: Date.now() - start });
    return res;
  } catch (err) {
    send(label, { type: 'error', error: serializeError(err), durationMs: Date.now() - start });
    throw err;
  }
}
