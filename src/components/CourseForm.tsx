import React, { useState } from 'react';
import { Upload, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';
import { useCategories } from '../context/CategoryContext';
import { useCourses } from '../context/CourseContext';
import { quarkParser, aliyunParser, baiduParser } from '../utils/parsers';

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
  const [linkError, setLinkError] = useState<string | null>(null);

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
    const normalizedLink = link.trim().toLowerCase();
    
    if (
      normalizedLink.includes('pan.quark.cn') || 
      normalizedLink.includes('pan-quark.cn')
    ) {
      return 'quark';
    }
    
    if (
      normalizedLink.includes('aliyundrive.com') || 
      normalizedLink.includes('alipan.com')
    ) {
      return 'aliyun';
    }
    
    if (
      normalizedLink.includes('pan.baidu.com') || 
      normalizedLink.includes('yun.baidu.com')
    ) {
      return 'baidu';
    }
    
    return null;
  };

  const validateShareLink = (link: string): string | null => {
    if (!link) {
      return '请输入分享链接';
    }

    try {
      new URL(link);
    } catch {
      return '请输入有效的网址';
    }

    const platform = detectPlatform(link);
    if (!platform) {
      return '目前仅支持夸克网盘、阿里云盘和百度网盘的分享链接';
    }

    return null;
  };

  const handleShareLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setFormData(prev => ({
      ...prev,
      shareLink: link,
    }));
    
    // 清除之前的错误
    setLinkError(null);
    
    // 如果链接为空，不进行验证
    if (!link.trim()) {
      return;
    }
    
    // 验证链接
    const error = validateShareLink(link);
    if (error) {
      setLinkError(error);
      return;
    }
    
    // 设置平台
    const platform = detectPlatform(link);
    setFormData(prev => ({
      ...prev,
      platform: platform || prev.platform
    }));
  };

  const handleParseLinkClick = async () => {
    if (!formData.shareLink) {
      setLinkError('请输入分享链接');
      return;
    }

    try {
      const url = formData.shareLink.trim();
      let parser;

      if (quarkParser.validate(url)) {
        parser = quarkParser;
      } else if (aliyunParser.validate(url)) {
        parser = aliyunParser;
      } else if (baiduParser.validate(url)) {
        parser = baiduParser;
      }

      if (!parser) {
        setLinkError('不支持的网盘链接格式');
        return;
      }

      const info = await parser.parse(url);
      
      // 更新表单数据
      setFormData(prev => ({
        ...prev,
        shareLink: info.validUrl,
        title: info.title || prev.title, // 如果解析出标题则使用
      }));
      
      setLinkError(null);
    } catch (error) {
      setLinkError('链接解析失败');
    }
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
            placeholder="请输入分享链接"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-24"
          />
          <button
            type="button"
            onClick={handleParseLinkClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Search className="w-4 h-4 mr-1" />
            解析
          </button>
        </div>
        {linkError && (
          <p className="mt-1 text-sm text-red-600">{linkError}</p>
        )}
        {formData.platform && !linkError && (
          <span className="mt-1 inline-block px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded">
            已识别: {
              formData.platform === 'quark' ? '夸克网盘' : 
              formData.platform === 'aliyun' ? '阿里云盘' : 
              formData.platform === 'baidu' ? '百度网盘' :
              '未知平台'
            }
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