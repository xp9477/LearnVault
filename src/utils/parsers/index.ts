export interface ShareLinkInfo {
  validUrl: string;
  title?: string;
  password?: string;
}

export interface Parser {
  validate: (url: string) => boolean;
  parse: (url: string, password?: string) => Promise<ShareLinkInfo>;
}

export { quarkParser } from './quarkParser';
export { aliyunParser } from './aliyunParser';
export { baiduParser } from './baiduParser';