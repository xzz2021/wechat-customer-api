import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { decrypt, encryptMsg, xml2json } from './utils';
import { ReceiveMessageType } from './type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private appid: string;
  private encodingAESKey: string;
  private token: string;
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    const env = this.getEnv();
    this.appid = env.appid;
    this.encodingAESKey = env.encodingAESKey;
    this.token = env.token;
  }

  getEnv() {
    return {
      appid: this.configService.get<string>('APPID') as string,
      encodingAESKey: this.configService.get<string>('ENCODING_AES_KEY') as string,
      token: this.configService.get<string>('TOKEN') as string,
    };
  }
  async receiveMessage(encrypted: string) {
    //  先解密数据  再发送加密数据
    try {
      const data = decrypt(encrypted, this.encodingAESKey);
      const dataJson = (await xml2json(data)) as ReceiveMessageType;
      const { channel, userid, content, appid } = dataJson;
      const sendData = {
        channel,
        openid: userid,
        msg: '正在处理您的请求，请稍等...',
        appid,
        sendMsg: content.msg,
      };
      //  先发送一次 避免用户等待无响应
      await this.sendMessage(encryptMsg(sendData, this.appid, this.encodingAESKey));

      const res = await this.httpService.axiosRef.post('http://localhost:6000/openai/receiveMsg', {
        msg: content.msg,
        requestId: userid,
      });
      // 上面可以使用任意chatgpt或deepseek服务 用作返回消息  requestId可以用作身份识别 实现缓存 或连续对话依据
      sendData.msg = res.data;
      await this.sendMessage(encryptMsg(sendData, this.appid, this.encodingAESKey));
    } catch (_error) {
      console.log('✨ 🍰 ✨ xzz2021: AppService -2222222> constructor -> error');
    }
  }

  async sendMessage(msg: string) {
    const api = `https://chatbot.weixin.qq.com/openapi/sendmsg/${this.token}`;
    try {
      await this.httpService.axiosRef.post(api, { encrypt: msg }, { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
      console.log('✨ 🍰 ✨ xzz2021: AppService ->3333333333 constructor -> error');
      return 'error';
    }
  }
}
