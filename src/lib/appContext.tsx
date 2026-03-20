import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockUser, UserProfile, UserRole, Lead, mockLeads, ChatThread, mockChatThreads, Review, mockReviews, TransportRequest, mockTransportRequests } from "./mockData";

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  chatThreads: ChatThread[];
  setChatThreads: React.Dispatch<React.SetStateAction<ChatThread[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  transportRequests: TransportRequest[];
  setTransportRequests: React.Dispatch<React.SetStateAction<TransportRequest[]>>;
  activeRole: UserRole;
  setActiveRole: React.Dispatch<React.SetStateAction<UserRole>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(mockChatThreads);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>(mockTransportRequests);
  const [activeRole, setActiveRole] = useState<UserRole>(mockUser.roles[0] || "Waste Trader");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <AppContext.Provider value={{ user, setUser, leads, setLeads, chatThreads, setChatThreads, reviews, setReviews, transportRequests, setTransportRequests, activeRole, setActiveRole, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
