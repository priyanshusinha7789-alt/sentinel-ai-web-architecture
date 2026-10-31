import type { Investigation } from "./types";

const STORAGE_KEY = "sentinel_ai_investigations_history";

export class InvestigationStorage {
  static getAll(): Investigation[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as Investigation[];
      }
    } catch {
      // LocalStorage access failure
    }
    return [];
  }

  static getById(id: string): Investigation | null {
    const list = this.getAll();
    return list.find((item) => item.id === id) || null;
  }

  static save(investigation: Investigation): void {
    if (typeof window === "undefined") return;
    try {
      const list = this.getAll();
      const filtered = list.filter((item) => item.id !== investigation.id);
      filtered.unshift(investigation); // Most recent first
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 50))); // Cap at 50 logs
    } catch {
      // LocalStorage write error
    }
  }

  static deleteById(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const list = this.getAll();
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // Storage error
    }
  }

  static clearAll(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage error
    }
  }
}
