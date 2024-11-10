export interface Course {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  shareLink: string;
  platform: 'quark' | 'aliyun' | 'baidu';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}