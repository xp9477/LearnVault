import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course } from '../types';

interface CourseContextType {
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (id: string, course: Course) => void;
  deleteCourse: (id: string) => void;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:3000/api';

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取所有课程
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      if (!response.ok) throw new Error('获取课程失败');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (course: Course) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      });
      
      if (!response.ok) throw new Error('添加课程失败');
      setCourses(prev => [...prev, course]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('删除课程失败');
      setCourses(prev => prev.filter(course => course.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
      throw err;
    }
  };

  const updateCourse = async (id: string, course: Course) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      });
      
      if (!response.ok) throw new Error('更新课程失败');
      setCourses(prev => prev.map(c => c.id === id ? course : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
      throw err;
    }
  };

  return (
    <CourseContext.Provider value={{ courses, addCourse, updateCourse, deleteCourse, loading, error }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
} 