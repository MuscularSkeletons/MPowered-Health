import { supabase } from "@/lib/supabase/client";
import { 
    createContext,
    useEffect,
    useState,
    ReactNode,
    useContext,
} from "react";
import { type User, type AuthContextType } from "@/types/user";

/** Information related to user authentication and its related functions */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** 
 * Defines all functions related to authentication including
 * User CRUD (create, read, update, delete) with Supabase (NOTE: automated deletion unimplemented)
 * Authentication related: sign-in using email and password and sign-out
*/
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // null until we check if user logged in or not
  const [isLoading, setIsLoading] = useState(true); // for initial session check when user opens the app

  /** 
   * Get the user information from supabase for the user with that userId (check if user authenticated)
   * Checks if user information exists when they sign-in/sign-up 
  */
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      // Fetch all user info from database for the given user id
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
        if (error) {
          if (__DEV__) console.debug('User profile request failed:', error.code);
          throw error;
        }

        const authUser = await supabase.auth.getUser(); // gets info about a user currently logged in
        if (!authUser.data.user) {
          if (__DEV__) console.debug('No authenticated user was available for the profile.');
          return null; // abort function early
        }

        /** 
         * A newly authenticated account may not have completed onboarding profile yet
         * Remain signed in so the onboarding flow can create that row on completion 
        */
        if (!data) {
          return {
            id: userId,
            name: '',
            email: authUser.data.user.email || '',
            onboardingComplete: false,
          };
        }

        // Return the user
        return {
          id: data.user_id,
          name: data.name,
          email: authUser.data.user.email || "", // get the email used for authentication
          birthsex: data.sex,
          birthyear: data.birth_year,
          formalDiagnosis: data.formal_diagnosis,
          painConditions: data.pain_conditions,
          otherCondition: data.other_condition,
          onboardingComplete: data.onboarding_complete,
        };

    } catch (error) {
      throw error;
    }
  }

  // NOTE: email authentication unimplemented
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ // NOTE: supabase has different options for this
      email,
      password,
    });

    if (error) throw error;

    console.log("User signed in");

    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id);
      setUser(userProfile);
      console.log("User profile information fetched and set");
    }
  };

  // Handles user sign up using an email and password authentication method
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

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
  };


  /** 
   * Deletes user 
   * NOTE: currently adds user id to delete requests table and signs user out
    * User can then be manually deleted from supabase, but automated deletion is unimplemented
  */
  const deleteUser = async () => {
    // Check user logged in
    if (!user) return;

    // add user id to delete requests table
      const { error } = await supabase
        .from("delete_request")
        .insert({ user_id: user.id });

    if (error) throw error;

    console.log("Delete request added to delete_request table. Awaiting manual delete by admin.");

    // Sign the user out
    await supabase.auth.signOut();
    setUser(null);
  };

  /**
   * Throughout onboarding sequence, a locally stored profile is built
   * Once get to completed screen, then the profile is saved to supabase
   */
  const updateUserDraft = (userData: Partial<User>) => {
    if (!user) return;
    setUser((current) => current ? { ...current, ...userData } : current);
    // Log field names only so health answers and personal details stay out of logs
    if (__DEV__) console.log('User draft updated locally:', Object.keys(userData));
  };

  // Update user info in supabase - pass in a partial value so can update any combination of fields
  const updateUser = async (userData: Partial<User>) => {
    // Check user logged in
    if (!user) return;

    try {
      // The values we want to update
      const updateData: any = {};
      // Only update data if the data to update is defined
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.birthsex !== undefined) updateData.sex = userData.birthsex;
      if (userData.birthyear !== undefined) updateData.birth_year = userData.birthyear;
      if (userData.formalDiagnosis !== undefined) updateData.formal_diagnosis = userData.formalDiagnosis;
      if (userData.painConditions !== undefined) updateData.pain_conditions = userData.painConditions;
      if (userData.otherCondition !== undefined) updateData.other_condition = userData.otherCondition;
      if (userData.onboardingComplete !== undefined) updateData.onboarding_complete = userData.onboardingComplete;

      // Update values in database
      const { error, data } = await supabase
        .from("user")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Update the change locally as well if successfully updated to supabase
      if (data) {
        if (__DEV__) console.log('User profile saved:', Object.keys(updateData));
        const userProfile = await fetchUserProfile(data.user_id);
        setUser(userProfile);
        if (__DEV__ && userProfile) console.log('Local user refreshed from saved profile');
      }

    } catch (error) {
      if (__DEV__) console.debug('User profile save failed.');
      throw error;
    }
  };

  // Updated user email
  const updateAuthUserEmail = async (email: string) => {
    // Check user logged in
    if (!user) return;

    // Update values in database
    const { data, error } = await supabase.auth.updateUser({
      email: email.trim(),
    });

    if (error) throw error;
    
    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id);
      if (!userProfile) {
        console.error("Error fetching user profile.");
        return; // abort early - do not set user profile to null
      }
      setUser(userProfile);
      console.log("User profile information fetched and set");
    }
  }

  /**
   * Updates current password with new password
   * Requires current password in order to update
   * NOTE: for maximum security, should turn on secure password change 
    * (requires user to reverify email before can update password) in supabase settings
    * This is currently left unimplemented as email verification is not yet implemented
   */
  const updateAuthUserPassword = async (currPassword: string, newPassword: string) => {
    // Check user logged in
    if (!user) return;

    // Update values in database
    const { data, error } = await supabase.auth.updateUser({
      current_password: currPassword,
      password: newPassword,
    });

    if (error) throw error;
    
    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id);
      setUser(userProfile);
      console.log("User profile information fetched and set");
    }
  }

  // Check if there is an existing session - automatically runs when open the app
  const checkSession = async () => {
    setIsLoading(true);
    // Tries to get a session from supabase to see if user logged in
    try {
      const { data: { session }} = await supabase.auth.getSession();

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setUser(userProfile);
        console.log("User profile information fetched and set"); 
      } else {
        console.log("User not logged in");
        setUser(null); // user is not logged in
      }
    } catch {
      if (__DEV__) console.debug('Saved session could not load its profile.');
      setUser(null);
    } finally {
      setIsLoading(false); // finished checking session so can proceed
    }
  }; 

  // Restore the saved login when this provider first appears
  useEffect(() => {
    void Promise.resolve().then(checkSession);
    /** 
     * Check the saved login only once when the app opens
     * Checking again while the user answers questions could erase their unsaved answers 
    */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider 
        value={{ 
          user, 
          signIn, 
          signUp, 
          signOut, 
          deleteUser,
          updateUserDraft, 
          updateUser, 
          isLoading,
          updateAuthUserEmail,
          updateAuthUserPassword, }}
    >
        {children}
    </AuthContext.Provider>
  );
};

// Can access all functions defined here from one import
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("calling from outside the provider");
  }
  return context;
};
