import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  testEndpoint() {
    return { message: 'Hello, world!' };
  }
}
