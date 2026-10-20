export interface User {
  id: string;
  name: string;
  email: string;
  birthsex?: string;
  birthyear?: number;
  formalDiagnosis?: boolean;
  painConditions?: string[];
  otherCondition?: string | null;
  onboardingComplete?: boolean;
}

export interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteUser: () => Promise<void>;
  updateUserDraft: (userData: Partial<User>) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  updateAuthUserEmail: (email: string) => Promise<void>;
  updateAuthUserPassword: (currPassword: string, newPassword: string) => Promise<void>;
}