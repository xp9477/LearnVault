import { ExternalLink, Trash2, Edit, Plus, Minus } from 'lucide-react';
import type { Course } from '../types';
import { useCourses } from '../context/CourseContext';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { deleteCourse, updateCourse } = useCourses();
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

  const handleUpdateProgress = async (increment: boolean) => {
    if (!course.totalEpisodes) return;
    
    const newWatchedEpisodes = increment 
      ? Math.min(course.watchedEpisodes + 1, course.totalEpisodes)
      : Math.max(course.watchedEpisodes - 1, 0);
      
    try {
      await updateCourse(course.id, {
        ...course,
        watchedEpisodes: newWatchedEpisodes
      });
    } catch (error) {
      console.error('更新进度失败:', error);
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <div className="flex space-x-1">
            <Link
              to={`/edit/${course.id}`}
              className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {course.teacher && (
              <span className="text-sm text-gray-600">
                {course.teacher}
              </span>
            )}
            <span className="inline-block px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
              {platformLabels[course.platform]}
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            创建时间：{new Date(course.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="mt-4 flex flex-col space-y-4">
          <a
            href={course.shareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            开始学习
          </a>

          {course.totalEpisodes && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  学习进度: {course.watchedEpisodes}/{course.totalEpisodes}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleUpdateProgress(false)}
                    disabled={course.watchedEpisodes === 0}
                    className="p-1.5 text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateProgress(true)}
                    disabled={course.watchedEpisodes === course.totalEpisodes}
                    className="p-1.5 text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ 
                    width: `${(course.watchedEpisodes / course.totalEpisodes) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}