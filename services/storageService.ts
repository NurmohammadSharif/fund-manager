import { Entry, YearRecord } from '../types';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

const STORAGE_KEYS = {
  AUTH: 'fundmanager_auth'
};

export const storageService = {
  // NEW: Login via Backend
  login: async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, error: "Connection to server failed" };
    }
  },

  // NEW: Update Password via Backend
  updateAdminPassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/admin/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: "Failed to update password" };
    }
  },

  fetchAllData: async (): Promise<{ years: YearRecord[], entries: Entry[] }> => {
    try {
      const response = await fetch(`${API_BASE}/data`);
      if (!response.ok) throw new Error("Failed to fetch from DB");
      return await response.json();
    } catch (err) {
      console.error("DB Fetch Error, falling back to empty:", err);
      return { years: [], entries: [] };
    }
  },

  saveEntry: async (entry: Entry | Omit<Entry, 'id'>) => {
    await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  },

  deleteEntry: async (id: string) => {
    await fetch(`${API_BASE}/entries/${id}`, {
      method: 'DELETE'
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};