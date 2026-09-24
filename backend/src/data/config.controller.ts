import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly config: ConfigService) {}

  @Get('site')
  site() {
    return this.config.getSite();
  }

  @Put('site')
  setSite(@Body() data: unknown) {
    return this.config.setSite(data);
  }

  @Get(':collection')
  list(@Param('collection') collection: string) {
    return this.config.list(collection);
  }

  @Post(':collection')
  create(@Param('collection') collection: string, @Body() data: unknown) {
    return this.config.create(collection, data);
  }

  @Patch(':collection/:id')
  update(@Param('collection') collection: string, @Param('id') id: string, @Body() data: unknown) {
    return this.config.update(collection, Number(id), data);
  }

  @Delete(':collection/:id')
  remove(@Param('collection') collection: string, @Param('id') id: string) {
    return this.config.remove(collection, Number(id));
  }
}