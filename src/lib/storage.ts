export type StorageParser<T> = (rawValue: string) => T;

export const readStorage = <T>(key: string, parser: StorageParser<T>): T | null => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue === null ? null : parser(rawValue);
  } catch (error) {
    console.error(`读取本地存储失败（${key}）:`, error);
    return null;
  }
};

export const writeStorage = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`写入本地存储失败（${key}）:`, error);
    return false;
  }
};
