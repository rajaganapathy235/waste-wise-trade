import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserProfile, UserRole, Lead, mockLeads, ChatThread, mockChatThreads, Review, mockReviews, TransportRequest, mockTransportRequests, mockUser } from "./mockData";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  chatThreads: ChatThread[];
  setChatThreads: React.Dispatch<React.SetStateAction<ChatThread[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  transportRequests: TransportRequest[];
  setTransportRequests: React.Dispatch<React.SetStateAction<TransportRequest[]>>;
  activeRole: UserRole | null;
  setActiveRole: React.Dispatch<React.SetStateAction<UserRole | null>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(mockChatThreads);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [transportRequests, setTransportRequests] = useState<TransportRequest[]>(mockTransportRequests);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await fetchProfile(session.user.id);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setActiveRole(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .eq('id', userId)
      .single();

    if (profile && !error) {
      const roles = profile.user_roles ? profile.user_roles.map((r: any) => {
        // Map DB roles to UserRole type
        const roleMap: Record<string, UserRole> = {
          'trader': 'Waste Trader',
          'transporter': 'Recycling Mill', // Adjust mapping as needed
          'manufacturer': 'OE Mill',
          'admin': 'Waste Trader' // Admin can act as any role
        };
        return roleMap[r.role] || 'Waste Trader';
      }) : [];

      const mappedUser: UserProfile = {
        id: profile.id,
        phone: profile.phone || "",
        businessName: profile.business_name || "",
        gstNumber: profile.gstin || "",
        locationDistrict: profile.location || "",
        roles: roles,
        isVerified: profile.verification_status === 'verified',
        isSubscribed: profile.is_subscribed || false,
        subscriptionExpiry: profile.subscription_expiry,
        ebConsumerNumber: "",
        blockedUsers: [],
        verificationStatus: (profile.verification_status as any) || "none",
        trustScore: profile.trust_score || 0,
        totalReviews: profile.total_reviews || 0,
      };

      setUser(mappedUser);
      if (roles.length > 0) {
        setActiveRole(roles[0]);
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      leads, setLeads, 
      chatThreads, setChatThreads, 
      reviews, setReviews, 
      transportRequests, setTransportRequests, 
      activeRole, setActiveRole, 
      isLoggedIn, setIsLoggedIn,
      loading,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
