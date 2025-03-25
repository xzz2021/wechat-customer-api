export interface CacheMsgArrayType {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ReceiveMessageType {
  userid: string;
  appid: string;
  content: { msg: string; msgtype: string };
  from: number;
  status: number;
  kfstate: number;
  channel: number;
  assessment: number;
  createtime: number;
  msgtype: string;
}
