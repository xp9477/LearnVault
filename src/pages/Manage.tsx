import CourseForm from '../components/CourseForm';

export default function Manage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">创建新课程</h1>
      <CourseForm />
    </div>
  );
}