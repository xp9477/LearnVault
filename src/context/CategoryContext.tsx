import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Category } from '../types';
import { 
  Code2, 
  Palette, 
  Briefcase, 
  Languages, 
  Award,
  BookOpen,
  GraduationCap,
  Brain,
  Lightbulb,
  Rocket,
  Database,
  Globe,
  Terminal 
} from 'lucide-react';

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'  // 生产环境使用相对路径
  : 'http://localhost:3000/api';

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const iconMap = {
  'code-2': Code2,
  'palette': Palette,
  'briefcase': Briefcase,
  'languages': Languages,
  'award': Award,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'brain': Brain,
  'lightbulb': Lightbulb,
  'rocket': Rocket,
  'database': Database,
  'globe': Globe,
  'terminal': Terminal,
};

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('获取分类失败');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Category) => {
    setLoading(true);
    try {
      if (!category.name.trim()) {
        throw new Error('分类名称不能为空');
      }
      
      if (!Object.keys(iconMap).includes(category.icon)) {
        throw new Error('无效的分类图标');
      }

      const exists = categories.some(c => 
        c.name === category.name && c.id !== category.id
      );
      if (exists) {
        throw new Error('分类名称已存在');
      }

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) throw new Error('添加分类失败');
      setCategories(prev => [...prev, category]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, category: Category) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) throw new Error('更新分类失败');
      setCategories(prev => prev.map(c => c.id === id ? category : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('删除分类失败');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('刷新分类失败');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CategoryContext.Provider value={{ 
      categories, 
      addCategory, 
      updateCategory, 
      deleteCategory, 
      refreshCategories, 
      loading, 
      error 
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
} 