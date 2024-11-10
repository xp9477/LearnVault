import { Code2, Palette, Briefcase, Languages, Award, BookOpen, GraduationCap, Brain, Lightbulb, Rocket, Database, Globe, Terminal } from 'lucide-react';
import { useCategories } from '../context/CategoryContext';

interface CategoryListProps {
  onSelectCategory: (categoryId: string | null) => void;
  selectedCategory: string | null;
}

export default function CategoryList({ onSelectCategory, selectedCategory }: CategoryListProps) {
  const { categories, loading } = useCategories();
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

  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Code2;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((category) => {
        const Icon = getIcon(category.icon);
        const isSelected = selectedCategory === category.id;
        
        return (
          <div
            key={category.id}
            onClick={() => onSelectCategory(isSelected ? null : category.id)}
            className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-full ${
                isSelected ? 'bg-blue-500' : 'bg-blue-50'
              }`}>
                <Icon className={`w-6 h-6 ${
                  isSelected ? 'text-white' : 'text-blue-600'
                }`} />
              </div>
              <span className="font-medium text-gray-900">{category.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}