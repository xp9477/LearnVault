import type { Parser, ShareLinkInfo } from './index';

export const quarkParser: Parser = {
  validate(url: string) {
    return url.includes('pan.quark.cn') || url.includes('pan-quark.cn');
  },

  async parse(url: string): Promise<ShareLinkInfo> {
    // 实现夸克网盘的解析逻辑
    const validUrl = url.trim();
    return {
      validUrl,
      // 如果能解析出标题和密码，在这里添加
    };
  }
}; 