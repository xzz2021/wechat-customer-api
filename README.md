#### 微信智能对话 接入第三方api客服


##### 流程
1. [官网](https://chatbot.weixin.qq.com/)申请获取密匙三件套 `appid` `token` `encodingAESKey`, 将`test.env`改名为`.env`, 替换三件套
2. 回调接口接收消息后需要立即响应,否则微信会重复调用3遍接口(所以不能等待异步执行)
3. 先解密接收到的数据,再加密需要发送的消息(中间还需要xml和json互转), 官方文档没有js代码示例, 加解密函数在utils文件
4. 回调地址必须是https的域名, 启动本服务后使用nginx转发6000端口(默认)即可

**nginx配置示例**
```conf
server {
 listen 443 ssl http2;
 server_name 域名.com;
 ssl_certificate_key   /etc/nginx/cert/域名.com.key;
 ssl_certificate       /etc/nginx/cert/域名.com.pem;
 location / {
     proxy_pass http://127.0.0.1:6000;  # 将流量转发到目标端口
     proxy_set_header Host $host;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
     proxy_read_timeout 300s;
     proxy_send_timeout 300s;
 }
}
```
##### 运行项目
```bash
npm i
npm dev
```
或者使用pnpm

```bash
npm i pnpm -g
pnpm i 
pnpm dev
```