import { useState } from 'react';
import CategoryList from '../components/CategoryList';
import CourseCard from '../components/CourseCard';
import { useCourses } from '../context/CourseContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { courses, loading, error } = useCourses();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredCourses = selectedCategory
    ? courses.filter(course => course.category === selectedCategory)
    : courses;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">课程分类</h2>
        <CategoryList 
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {selectedCategory ? '分类课程' : '全部课程'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}