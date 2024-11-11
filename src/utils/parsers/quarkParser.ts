import type { Parser, ShareLinkInfo } from './index';

export const quarkParser: Parser = {
  validate(url: string) {
    return url.includes('pan.quark.cn') || url.includes('pan-quark.cn');
  },

  async parse(url: string, password?: string): Promise<ShareLinkInfo> {
    console.log('夸克解析器开始解析:', url);
    const validUrl = url.trim();
    
    const pwdIdMatch = validUrl.match(/\/s\/([\w-]+)/);
    if (!pwdIdMatch) {
      console.log('无效的夸克网盘链接');
      throw new Error('无效的夸克网盘链接');
    }
    
    const pwdId = pwdIdMatch[1];
    console.log('提取的 pwdId:', pwdId);
    
    try {
      console.log('发送网络请求...');
      const apiUrl = process.env.NODE_ENV === 'production'
        ? '/api/quark/token'
        : 'http://localhost:3000/api/quark/token';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': import.meta.env.QUARK_COOKIE || ''
        },
        body: JSON.stringify({
          pwd_id: pwdId,
          passcode: password || ''
        })
      });

      console.log('请求状态:', response.status);
      if (!response.ok) {
        throw new Error('获取课程信息失败');
      }

      const data = await response.json();
      console.log('响应数据:', data);
      
      if (data.code !== 0) {
        if (data.code === 401) {
          throw new Error('分享密码错误');
        }
        throw new Error(data.message || '解析失败');
      }

      return {
        validUrl,
        title: data.data.title,
        password
      };
    } catch (error) {
      console.error('夸克解析器错误:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('解析夸克网盘链接失败');
    }
  }
}; 