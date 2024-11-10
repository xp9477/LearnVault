import { useParams } from 'react-router-dom';
import CourseForm from '../components/CourseForm';
import { useCourses } from '../context/CourseContext';

export default function EditCourse() {
  const { id } = useParams();
  const { courses } = useCourses();
  const course = courses.find(c => c.id === id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">编辑课程</h1>
      <CourseForm initialData={course} />
    </div>
  );
} 