import { BookOpen, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const isManage = location.pathname === '/manage';
  const isCategories = location.pathname === '/categories';

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LearnVault</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {!isCategories && (
              <Link
                to="/categories"
                className="text-gray-600 hover:text-gray-900"
              >
                分类管理
              </Link>
            )}
            <Link
              to={isManage || isCategories ? '/' : '/manage'}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isManage || isCategories ? (
                <span>返回首页</span>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  <span>创建课程</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}