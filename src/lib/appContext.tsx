import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockUser, UserProfile, UserRole, Lead, mockLeads } from "./mockData";

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  activeRole: UserRole;
  setActiveRole: React.Dispatch<React.SetStateAction<UserRole>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [activeRole, setActiveRole] = useState<UserRole>(mockUser.roles[0] || "Waste Trader");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <AppContext.Provider value={{ user, setUser, leads, setLeads, activeRole, setActiveRole, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
