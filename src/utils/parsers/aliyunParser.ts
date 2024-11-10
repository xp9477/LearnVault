import type { Parser, ShareLinkInfo } from './index';

export const aliyunParser: Parser = {
  validate(url: string) {
    return url.includes('aliyundrive.com') || url.includes('alipan.com');
  },

  async parse(url: string): Promise<ShareLinkInfo> {
    const validUrl = url.trim();
    return {
      validUrl,
      // 实现阿里云盘的解析逻辑
    };
  }
}; 