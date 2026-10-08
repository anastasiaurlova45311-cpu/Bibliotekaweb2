import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: 'read' | 'reading' | 'want';
  isbn: string;
  totalPages: number | null;
  currentPage: number;
  rating: number;
  coverUrl: string | null;
  dateAdded: number;
}

function getBooksKey(userId: string): string {
  return `myLibrary_books_${userId}`;
}

function getGoalKey(userId: string): string {
  return `myLibrary_goal_${userId}`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function loadBooks(userId: string): Book[] {
  try {
    const data = localStorage.getItem(getBooksKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveBooks(userId: string, books: Book[]) {
  localStorage.setItem(getBooksKey(userId), JSON.stringify(books));
}

export function useBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setBooks(loadBooks(user.id));
      setLoading(false);
    } else {
      setBooks([]);
      setLoading(false);
    }
  }, [user]);

  const addBook = useCallback(async (bookData: Omit<Book, 'id'>) => {
    if (!user) return;
    const newBook: Book = { ...bookData, id: generateId() };
    const updated = [...books, newBook];
    setBooks(updated);
    saveBooks(user.id, updated);
    return newBook;
  }, [user, books]);

  const updateBook = useCallback(async (id: string, data: Partial<Book>) => {
    if (!user) return;
    const updated = books.map(b => b.id === id ? { ...b, ...data } : b);
    setBooks(updated);
    saveBooks(user.id, updated);
  }, [user, books]);

  const deleteBook = useCallback(async (id: string) => {
    if (!user) return;
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    saveBooks(user.id, updated);
  }, [user, books]);

  const importBooks = useCallback(async (importedBooks: Book[]) => {
    if (!user) return;
    // Ensure all imported books have IDs
    const booksWithIds = importedBooks.map(b => ({
      ...b,
      id: b.id || generateId(),
    }));
    setBooks(booksWithIds);
    saveBooks(user.id, booksWithIds);
  }, [user]);

  return {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    importBooks,
  };
}

export function useGoal() {
  const { user } = useAuth();
  const [goal, setGoal] = useState(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      try {
        const stored = localStorage.getItem(getGoalKey(user.id));
        if (stored) {
          const parsed = parseInt(stored);
          if (!isNaN(parsed) && parsed > 0) {
            setGoal(parsed);
          }
        }
      } catch {
        // Use default
      }
      setLoading(false);
    } else {
      setGoal(12);
      setLoading(false);
    }
  }, [user]);

  const saveGoal = useCallback((newGoal: number) => {
    if (!user) return;
    setGoal(newGoal);
    localStorage.setItem(getGoalKey(user.id), newGoal.toString());
  }, [user]);

  return {
    goal,
    loading,
    saveGoal,
  };
}
