import type { Item, TransactionType } from "../types/transaction";

export const createId = () => crypto.randomUUID();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const fixOldData = (
  items: unknown[],
  type: TransactionType,
): Item[] => {
  return items.filter(isRecord).map((item) => {
    const amount = Number(item.amount);

    return {
      id:
        typeof item.id === "string" || typeof item.id === "number"
          ? String(item.id)
          : createId(),

      text: typeof item.text === "string" ? item.text : "",

      amount: Number.isFinite(amount) ? amount : 0,

      date:
        typeof item.date === "string" && item.date
          ? item.date
          : new Date().toISOString().slice(0, 10),

      type,
    };
  });
};

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);

    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}