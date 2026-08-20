/**
 * localStorage 读写工具
 *
 * 统一处理各 Hook 中重复的「读取 -> 解析 -> 校验 -> 容错」流程，
 * 保证损坏或非法的存储数据不会导致应用崩溃。
 */

/** 读取字符串值，读取失败时返回 null */
export const readString = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** 写入字符串值，写入失败（如隐私模式）时静默忽略 */
export const writeString = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 忽略写入失败
  }
};

/**
 * 读取并解析 JSON 值
 *
 * @param key - 存储键
 * @param isValid - 结构校验函数，校验不通过时返回 null
 * @returns 解析后的值，读取/解析/校验失败时返回 null
 */
export const readJSON = <T>(key: string, isValid: (value: unknown) => value is T): T | null => {
  const stored = readString(key);
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** 序列化并写入 JSON 值 */
export const writeJSON = <T>(key: string, value: T): void => {
  writeString(key, JSON.stringify(value));
};
