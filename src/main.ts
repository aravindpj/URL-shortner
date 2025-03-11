import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get queue instances
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const analyticsQueue = app.get(`BullQueue_analytics`);

  // Setup Bull Board
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    queues: [new BullAdapter(analyticsQueue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
