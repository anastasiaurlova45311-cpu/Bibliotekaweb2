import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'myLibrary_users';
const SESSION_KEY = 'myLibrary_session';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && parsed.id && parsed.email) {
          setUser({ id: parsed.id, email: parsed.email, name: parsed.name || parsed.email });
        }
      }
    } catch {
      // Invalid session
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { error: 'Пользователь не найден' };
    }
    if (found.password !== password) {
      return { error: 'Неверный пароль' };
    }
    const sessionUser = { id: found.id, email: found.email, name: found.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return {};
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Пользователь с таким email уже существует' };
    }
    if (password.length < 4) {
      return { error: 'Пароль должен быть не менее 4 символов' };
    }
    const newUser: StoredUser = {
      id: generateId(),
      email,
      password,
      name,
    };
    users.push(newUser);
    saveStoredUsers(users);
    const sessionUser = { id: newUser.id, email: newUser.email, name: newUser.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return {};
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
