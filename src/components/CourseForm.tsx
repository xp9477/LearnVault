import React, { useState } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';
import { useCategories } from '../context/CategoryContext';
import { useCourses } from '../context/CourseContext';

interface CourseFormProps {
  initialData?: Course;
}

export default function CourseForm({ initialData }: CourseFormProps) {
  const navigate = useNavigate();
  const { addCourse, updateCourse } = useCourses();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    shareLink: initialData?.shareLink || '',
    platform: initialData?.platform || '' as Course['platform'],
  });
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || '');
  const [error, setError] = useState('');
  const { categories } = useCategories();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('图片大小不能超过5MB');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('http://localhost:3000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '上传失败');
        }

        const data = await response.json();
        setPreviewUrl(`http://localhost:3000${data.imageUrl}`);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : '图片上传失败');
        console.error('上传错误:', err);
      }
    }
  };

  const detectPlatform = (link: string): Course['platform'] | null => {
    if (link.includes('quark')) return 'quark';
    if (link.includes('aliyun')) return 'aliyun';
    if (link.includes('baidu')) return 'baidu';
    return null;
  };

  const handleShareLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    const platform = detectPlatform(link);
    setFormData(prev => ({
      ...prev,
      shareLink: link,
      platform: platform || prev.platform
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!formData.title.trim()) {
        setError('请输入课程标题');
        return;
      }
      if (!formData.category) {
        setError('请选择课程分类');
        return;
      }
      if (!formData.shareLink) {
        setError('请输入分享链接');
        return;
      }
      if (!formData.platform) {
        setError('无法识别网盘平台，请检查链接');
        return;
      }

      const courseData: Course = {
        id: initialData?.id || Date.now().toString(),
        title: formData.title,
        category: formData.category,
        imageUrl: previewUrl || 'http://localhost:3000/uploads/default-course-image.jpg',
        shareLink: formData.shareLink,
        platform: formData.platform,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };

      if (initialData) {
        await updateCourse(initialData.id, courseData);
      } else {
        await addCourse(courseData);
      }
      navigate('/');
    } catch (err) {
      console.error('保存失败:', err);
      setError(err instanceof Error ? err.message : '保存失败，请重试');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          课程标题
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="请输入课程标题"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          课程分类
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">请选择分类</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          课程封面
        </label>
        <div className="relative">
          {previewUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl('');
                }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">点击上传课程封面</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          网盘分享链接
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.shareLink}
            onChange={handleShareLinkChange}
            placeholder="请输入夸克网盘、阿里网盘或百度网盘的分享链接"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        {formData.platform && (
          <span className="mt-1 inline-block px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded">
            已识别: {formData.platform === 'quark' ? '夸克网盘' : formData.platform === 'aliyun' ? '阿里网盘' : '百度网���'}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {initialData ? '保存修改' : '创建课程'}
      </button>
    </form>
  );
}