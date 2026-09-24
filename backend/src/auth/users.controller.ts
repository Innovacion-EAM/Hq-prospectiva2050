import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Roles } from './public.decorator';
import { UsersService } from './users.service';
import type { CreateUserInput, UpdateUserInput } from './users.service';

interface AuthedRequest extends Request {
  user?: { sub: number; email: string; role: string };
}

@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.findAll();
  }

  @Post()
  create(@Body() body: CreateUserInput) {
    return this.users.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserInput) {
    return this.users.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.users.remove(Number(id), req.user?.sub ?? 0);
  }
}