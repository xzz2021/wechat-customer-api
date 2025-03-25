import * as crypto from 'crypto';
import * as xml2js from 'xml2js';

// 导入环境变量
const getAESKey = (encodingAESKey: string) => {
  const AESKey = Buffer.from(encodingAESKey + '=', 'base64');
  if (AESKey.length !== 32) {
    throw new Error('encodingAESKey invalid');
  }
  return {
    AESKey,
    iv: AESKey.subarray(0, 16),
  };
};

const pkcs5UnPadding = (text: Buffer) => {
  let pad = text[text.length - 1];
  if (pad < 1 || pad > 32) {
    pad = 0;
  }
  return text.subarray(0, text.length - pad);
};

export const decrypt = (text: string, encodingAESKey: string) => {
  const { AESKey, iv } = getAESKey(encodingAESKey);
  const decipher = crypto.createDecipheriv('aes-256-cbc', AESKey, iv);
  decipher.setAutoPadding(false);
  const deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);
  return pkcs5UnPadding(deciphered).toString();
};

export const xml2json = async (rawXml: string) => {
  const xmlMatch = rawXml.match(/<xml>[\s\S]*<\/xml>/);
  if (!xmlMatch) {
    throw new Error('Invalid XML format');
  }
  const xml = xmlMatch[0];
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xml);
  return result?.xml;
};

export const json2xml = (json: any) => {
  const builder = new xml2js.Builder({
    rootName: 'xml',
    cdata: true,
    headless: true,
  });
  const xml = builder.buildObject(json);
  return xml;
};

function aesCBCEncrypt(key: string, data: Buffer): Buffer {
  const keyBuffer = Buffer.from(key, 'base64');
  if (keyBuffer.length !== 32) {
    throw new Error('Invalid encodingKey length, expected 32 bytes after base64 decoding.');
  }
  const iv = keyBuffer.subarray(0, 16);
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted;
}

export function encrypt(plaintextMsg: string | Buffer, appid: string, encodingAESKey: string): string {
  const randomString = crypto.randomBytes(16);
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(Buffer.byteLength(plaintextMsg, 'utf-8'), 0);
  const msgBuffer = Buffer.isBuffer(plaintextMsg) ? plaintextMsg : Buffer.from(plaintextMsg, 'utf-8');
  const msg = Buffer.concat([randomString, lengthBuffer, msgBuffer, Buffer.from(appid, 'utf-8')]);
  const encryptedMsg = aesCBCEncrypt(encodingAESKey, msg);
  return encryptedMsg.toString('base64');
}

export const encryptMsg = (jsonData: object, appid: string, encodingAESKey: string) => {
  const xmlData = json2xml(jsonData);
  const encryptedData = encrypt(xmlData, appid, encodingAESKey);
  return encryptedData;
};
