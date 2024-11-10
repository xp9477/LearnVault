import { useParams } from 'react-router-dom';
import CourseForm from '../components/CourseForm';
import { useCourses } from '../context/CourseContext';
import { Loader2 } from 'lucide-react';

export default function EditCourse() {
  const { id } = useParams();
  const { courses, loading, error } = useCourses();
  const course = courses.find(c => c.id === id);

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

  if (!course) {
    return (
      <div className="text-center text-red-600 py-8">
        未找到课程信息
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">编辑课程</h1>
      <CourseForm initialData={course} />
    </div>
  );
} 