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
  birthsex?: string;
  birthyear?: number;
  onboardingCompleted?: boolean; // optional field: have they completed onboarding
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
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

  // update user info in supabase - partial so can accept some of fields in user
  const updateUser = async (userData: Partial<User>) => {
    // check user logged in
    if (!user) return;

    try {
      // values that we pass from user data field
      const updateData: any = {};
      // only update data if the data to update is defined
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.birthsex !== undefined) updateData.birthsex = userData.birthsex;
      if (userData.birthyear !== undefined) updateData.birthyear = userData.birthyear;
      if (userData.onboardingCompleted !== undefined) updateData.onboardingCompleted = userData.onboardingCompleted;

      const { error } = await supabase
        .from("User")
        .update(updateData)
        .eq("user_id", user.id);
      if (error) throw error;

    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
        value={{ user, signUp, updateUser }}
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