import { useState } from 'react';
import { useCategories } from '../context/CategoryContext';
import { 
  Code2, 
  Palette, 
  Briefcase, 
  Languages, 
  Award,
  BookOpen,
  GraduationCap,
  Brain,
  Lightbulb,
  Rocket,
  Database,
  Globe,
  Terminal,
  Plus,
  Edit2, 
  Trash2 
} from 'lucide-react';
import type { Category } from '../types';

const iconMap = {
  'code-2': Code2,
  'palette': Palette,
  'briefcase': Briefcase,
  'languages': Languages,
  'award': Award,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'brain': Brain,
  'lightbulb': Lightbulb,
  'rocket': Rocket,
  'database': Database,
  'globe': Globe,
  'terminal': Terminal,
};

export default function ManageCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'code-2'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData: Category = {
        id: editingCategory?.id || Date.now().toString(),
        name: formData.name,
        icon: formData.icon,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }

      setFormData({ name: '', icon: 'code-2' });
      setIsEditing(false);
      setEditingCategory(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : '操作失败');
    }
  };

  const handleEdit = (category: Category) => {
    setIsEditing(true);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个分类吗？')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        alert('删除失败');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理分类</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加分类
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="请输入分类名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类图标
              </label>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(iconMap).map(([key, Icon]) => (
                  <div
                    key={key}
                    onClick={() => setFormData(prev => ({ ...prev, icon: key }))}
                    className={`p-4 rounded-lg cursor-pointer flex justify-center items-center ${
                      formData.icon === key ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingCategory(null);
                  setFormData({ name: '', icon: 'code-2' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCategory ? '保存修改' : '添加分类'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => {
          const Icon = iconMap[category.icon as keyof typeof iconMap];
          return (
            <div key={category.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 