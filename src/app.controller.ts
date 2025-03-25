import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
@Controller('wechat')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('receiveMessage')
  receiveMessage(@Body() body: { encrypted: string }) {
    void this.appService.receiveMessage(body?.encrypted);
    return 'success';
  }
}
