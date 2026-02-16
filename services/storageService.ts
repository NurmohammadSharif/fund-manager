import { Entry, YearRecord } from '../types';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

const STORAGE_KEYS = {
  AUTH: 'fundmanager_auth'
};

export const storageService = {
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

  // Verify the collection ledger passkey
  verifyCollectionKey: async (key: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/verify-collection-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: "Verification server unavailable" };
    }
  },

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

  // Change the key used to unlock collection details
  updateCollectionKey: async (adminPassword: string, newCollectionKey: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/admin/update-collection-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword, newCollectionKey })
      });
      return await response.json();
    } catch (err) {
      return { success: false, error: "Failed to update collection key" };
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