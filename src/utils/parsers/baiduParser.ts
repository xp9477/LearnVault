import type { Parser, ShareLinkInfo } from './index';

export const baiduParser: Parser = {
  validate(url: string) {
    return url.includes('pan.baidu.com') || url.includes('yun.baidu.com');
  },

  async parse(url: string): Promise<ShareLinkInfo> {
    const validUrl = url.trim();
    return {
      validUrl,
      // 实现百度网盘的解析逻辑
    };
  }
}; 