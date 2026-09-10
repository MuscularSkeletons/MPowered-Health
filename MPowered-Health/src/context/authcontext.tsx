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

  // get the user information from supabase for the user with that userId (check if user authenticated)
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("user_id", userId)
        .single();
      
        if (error) {
          console.error("Error fetching user profile:", error);
          return null; // abort function early
        }

        if (!data) {
          console.error("User profile data not found");
          return null; // abort function early
        }

        const authUser = await supabase.auth.getUser(); // gets info about a user currentlly logged in
        if (!authUser.data.user) {
          console.error("No authenticated user found");
          return null; // abort function early
        }

        // return the user
        return {
          id: data.user_id,
          name: data.name,
          email: authUser.data.user.email || "",
          birthsex: data.sex,
          birthyear: data.birth_year,
        };

    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  const signIn = async (email: string, password: string) => {
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("User signed up");

    if (error) throw error;

    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id);
      setUser(userProfile);
      console.log("User profile information fetched and set");
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
      if (userData.email !== undefined) updateData.email_address = userData.email;
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.birthsex !== undefined) updateData.sex = userData.birthsex;
      if (userData.birthyear !== undefined) updateData.birth_year = userData.birthyear;

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