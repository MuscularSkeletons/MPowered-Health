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
  onboardingComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // null until we check if user logged in or not
  const [isLoading, setIsLoading] = useState(true); // for initial session check when user opens the app

  // run checkSession when first render the app
  useEffect(() => {
    checkSession();
  }, []);

  // get the user information from supabase for the user with that userId (check if user authenticated)
  // checks if user information exists when they sign-in/sign-up
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      // fetch all user info from db for the given user id
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

        const authUser = await supabase.auth.getUser(); // gets info about a user currently logged in
        if (!authUser.data.user) {
          console.error("No authenticated user found");
          return null; // abort function early
        }

        // return the user
        return {
          id: data.user_id,
          name: data.name,
          email: authUser.data.user.email || "", // get the email used for authentication
          birthsex: data.sex,
          birthyear: data.birth_year,
          onboardingComplete: data.onboarding_complete,
        };

    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  // TODO: implement sign in using email and password
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ // supabase has different options for this
      email,
      password,
    });

    if (error) throw error; // TO DO: try-catch block? maybe??

    console.log("User signed in");

    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id);
      setUser(userProfile);
      console.log("User profile information fetched and set");
    }
  };

  // handles user sign up using an email and pasword authentication method
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error; // TO DO: try-catch block? maybe??

    console.log("User signed up");

    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id);
      setUser(userProfile);
      console.log("User profile information fetched and set");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  }

  // update user info in supabase - pass in a partial value so can update any combination of fields
  const updateUser = async (userData: Partial<User>) => {
    // check user logged in
    if (!user) return;

    try {
      // the values we want to update
      const updateData: any = {};
      // only update data if the data to update is defined
      if (userData.email !== undefined) updateData.email_address = userData.email;
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.birthsex !== undefined) updateData.sex = userData.birthsex;
      if (userData.birthyear !== undefined) updateData.birth_year = userData.birthyear;
      if (userData.onboardingComplete !== undefined) updateData.onboarding_complete = userData.onboardingComplete;

      // update values in db
      const { error, data } = await supabase
        .from("User")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // update the change here
      if (data) {
        console.log(data);
        const userProfile = await fetchUserProfile(data.user_id);
        setUser(userProfile);
        console.log("updated change locally (?)");
      }

    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // check if there is an existing session - automatically runs when open the app
  const checkSession = async () => {
    setIsLoading(true);
    // tries to get a session from supabase to see if user logged in
    try {
      const { data: { session }} = await supabase.auth.getSession();

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setUser(userProfile);
        console.log("User profile information fetched and set"); 
      } else {
        setUser(null); // user is not logged in
      }
    } catch (error) {
      console.error("Error checking session", error);
      setUser(null);
    } finally {
      setIsLoading(false); // finished checking session so can proceed
    }
  }; 

  return (
    <AuthContext.Provider 
        value={{ user, signIn, signUp, signOut, updateUser, isLoading }}
    >
        {children}
    </AuthContext.Provider>

  );

};

// allows easy access to functions defined here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("calling from outside the provider");
  }
  return context;
};