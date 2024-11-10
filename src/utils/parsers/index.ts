export interface ShareLinkInfo {
  validUrl: string;
  title?: string;
}

export interface Parser {
  validate: (url: string) => boolean;
  parse: (url: string) => Promise<ShareLinkInfo>;
}

export const quarkParser: Parser = {
  validate: (url: string) => url.includes('pan.quark.cn') || url.includes('pan-quark.cn'),
  parse: async (url: string) => ({
    validUrl: url,
  })
};

export const aliyunParser: Parser = {
  validate: (url: string) => url.includes('aliyundrive.com') || url.includes('alipan.com'),
  parse: async (url: string) => ({
    validUrl: url,
  })
};

export const baiduParser: Parser = {
  validate: (url: string) => url.includes('pan.baidu.com') || url.includes('yun.baidu.com'),
  parse: async (url: string) => ({
    validUrl: url,
  })
}; 