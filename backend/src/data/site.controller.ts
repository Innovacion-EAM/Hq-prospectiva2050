import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { SiteService } from './site.service';

@Public()
@Controller('site')
export class SiteController {
  constructor(private readonly site: SiteService) {}

  @Get()
  get() {
    return this.site.getSiteData();
  }
}