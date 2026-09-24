import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from '../entities/media.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}