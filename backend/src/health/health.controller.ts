import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  liveness() {
    return { status: 'ok' };
  }

  @Get('db')
  async readiness() {
    const connected = await this.pingDb();
    if (!connected) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
      });
    }
    return { status: 'ok', database: 'connected' };
  }

  private async pingDb(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}