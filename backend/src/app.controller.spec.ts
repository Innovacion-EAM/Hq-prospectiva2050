import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockDataSource = {
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return api up and database connected', async () => {
      await expect(appController.getStatus()).resolves.toEqual({
        status: 'ok',
        api: 'up',
        database: 'connected',
      });
    });

    it('should report database disconnected when query fails', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('down'));
      await expect(appController.getStatus()).resolves.toEqual({
        status: 'ok',
        api: 'up',
        database: 'disconnected',
      });
    });
  });
});