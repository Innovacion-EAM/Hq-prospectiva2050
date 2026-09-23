import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getStatus(): Promise<Record<string, unknown>> {
    const connected = await this.pingDb();
    return {
      status: 'ok',
      api: 'up',
      database: connected ? 'connected' : 'disconnected',
    };
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