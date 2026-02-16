import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import AdminDashboard from './views/AdminDashboard';
import LoginView from './views/LoginView';
import { storageService } from './services/storageService';
import { Entry, YearRecord, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fundmanager_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [years, setYears] = useState<YearRecord[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data from MongoDB on startup
  useEffect(() => {
    const initData = async () => {
      const data = await storageService.fetchAllData();
      
      // If DB is empty, create a default year
      if (data.years.length === 0) {
        const currentYear = new Date().getFullYear().toString();
        const initialYear: YearRecord = { id: currentYear, openingBalance: 0, isClosed: false };
        setYears([initialYear]);
      } else {
        setYears(data.years);
      }
      setEntries(data.entries);
      setIsLoading(false);
    };
    initData();
  }, []);

  const sortedYears = useMemo(() => [...years].sort((a, b) => b.id.localeCompare(a.id)), [years]);

  const [selectedYearId, setSelectedYearId] = useState<string>(() => {
    return new Date().getFullYear().toString();
  });

  // Update selected year if the years list changes and current selection is invalid
  useEffect(() => {
    if (sortedYears.length > 0 && !years.find(y => y.id === selectedYearId)) {
      setSelectedYearId(sortedYears[0].id);
    }
  }, [sortedYears, selectedYearId]);

  const handleLogin = (username: string) => {
    const newUser = { username, isAdmin: true };
    setUser(newUser);
    localStorage.setItem('fundmanager_auth', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fundmanager_auth');
  };

  const addEntry = async (newEntry: Omit<Entry, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const entryWithId = { ...newEntry, id };
    
    // Optimistic Update
    setEntries(prev => [...prev, entryWithId]);
    
    // Save to MongoDB
    await storageService.saveEntry(entryWithId);
  };

  const updateEntry = async (updated: Entry) => {
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
    await storageService.saveEntry(updated);
  };

  const deleteEntry = async (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    await storageService.deleteEntry(id);
  };

  const createNextYear = () => {
    const latestYear = sortedYears[0];
    if (!latestYear) return;

    const yearEntries = entries.filter(e => e.yearId === latestYear.id);
    const collections = yearEntries.filter(e => e.type === 'collection').reduce((sum, e) => sum + e.amount, 0);
    const expenses = yearEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const currentBalance = latestYear.openingBalance + collections - expenses;

    const nextYearId = (parseInt(latestYear.id) + 1).toString();
    if (years.some(y => y.id === nextYearId)) {
        alert("Next year already exists!");
        return;
    }

    const newYear: YearRecord = {
      id: nextYearId,
      openingBalance: currentBalance,
      isClosed: false
    };

    setYears(prev => [...prev, newYear]);
    setSelectedYearId(nextYearId);
    // Note: In a real app, you'd also save the new year object to the DB
  };

  const closeYear = (yearId: string) => {
    setYears(prev => prev.map(y => {
      if (y.id === yearId) {
        return { ...y, isClosed: true, closedAt: new Date().toISOString() };
      }
      return y;
    }));
  };

  const stats = useMemo(() => {
    const year = years.find(y => y.id === selectedYearId);
    const yearEntries = entries.filter(e => e.yearId === selectedYearId);
    
    const collections = yearEntries.filter(e => e.type === 'collection').reduce((sum, e) => sum + e.amount, 0);
    const expenses = yearEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const opening = year?.openingBalance || 0;

    return {
      totalCollection: collections,
      totalExpense: expenses,
      openingBalance: opening,
      currentBalance: opening + collections - expenses
    };
  }, [entries, selectedYearId, years]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">Connecting to MongoDB Atlas...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout isAdmin={!!user?.isAdmin} onLogout={handleLogout}>
        <Routes>
          <Route 
            path="/" 
            element={
              <HomeView 
                stats={stats} 
                entries={entries.filter(e => e.yearId === selectedYearId)} 
                years={sortedYears}
                selectedYearId={selectedYearId}
                setSelectedYearId={setSelectedYearId}
                isAdmin={!!user?.isAdmin}
              />
            } 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/admin" /> : <LoginView onLogin={handleLogin} />} 
          />
          <Route 
            path="/admin" 
            element={
              user ? (
                <AdminDashboard 
                  stats={stats}
                  entries={entries.filter(e => e.yearId === selectedYearId)}
                  years={sortedYears}
                  selectedYearId={selectedYearId}
                  setSelectedYearId={setSelectedYearId}
                  addEntry={addEntry}
                  updateEntry={updateEntry}
                  deleteEntry={deleteEntry}
                  closeYear={closeYear}
                  createNextYear={createNextYear}
                  onExport={() => {}} // Handle export via DB query if needed
                  onImport={() => {}} 
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;