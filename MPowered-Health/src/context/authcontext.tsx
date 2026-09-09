import { supabase } from "@/lib/supabase/client";
import { 
    createContext,
    useEffect,
    useState,
    ReactNode,
    useContext,
} from "react";

// information related to user authentication + its related functions

export interface User {
  id: string;
  name: string;
  email: string;
  onboardingCompleted?: boolean; // optional field: have they completed onboarding
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string) => Promise<void>;
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // null until we check if user logged in or not

  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (email: string, password: string) => {
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
        console.log(user); // TODO: temp
    }
  };

  return (
    <AuthContext.Provider 
        value={{ user, signUp }}
    >
        {children}
    </AuthContext.Provider>

  );

};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("calling from outside the provider");
  }
  return context;
};