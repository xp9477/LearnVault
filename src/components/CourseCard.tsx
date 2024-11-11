import { ExternalLink, Trash2, Edit } from 'lucide-react';
import type { Course } from '../types';
import { useCourses } from '../context/CourseContext';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { deleteCourse } = useCourses();
  const platformLabels = {
    quark: '夸克网盘',
    aliyun: '阿里云盘',
    baidu: '百度网盘',
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这个课程吗？')) {
      deleteCourse(course.id);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <img
        src={course.imageUrl}
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
          <div className="flex space-x-2">
            <Link
              to={`/edit/${course.id}`}
              className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
          {course.teacher && (
              <span className="text-sm text-gray-500">
                {course.teacher}
              </span>
            )}
            <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {platformLabels[course.platform]}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            创建时间：{new Date(course.createdAt).toLocaleDateString()}
          </div>
        </div>
        <a
          href={course.shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          开始学习
        </a>
      </div>
    </div>
  );
}