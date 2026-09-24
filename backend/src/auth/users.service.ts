import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export interface UserDto {
  id: number;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  toDto(user: User): UserDto {
    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.repo.find({ order: { id: 'ASC' } });
    return users.map((u) => this.toDto(u));
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async create(input: CreateUserInput): Promise<UserDto> {
    const email = input.email.toLowerCase().trim();
    const duplicate = await this.findOneByEmail(email);
    if (duplicate) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }
    const passwordHash = await this.hash(input.password);
    const user = this.repo.create({
      email,
      passwordHash,
      role: input.role ?? 'editor',
    });
    return this.toDto(await this.repo.save(user));
  }

  async update(id: number, input: UpdateUserInput): Promise<UserDto> {
    const user = await this.findOne(id);
    if (input.email !== undefined) {
      const email = input.email.toLowerCase().trim();
      const duplicate = await this.findOneByEmail(email);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }
      user.email = email;
    }
    if (input.password !== undefined && input.password.trim()) {
      user.passwordHash = await this.hash(input.password);
    }
    if (input.role !== undefined && input.role !== user.role) {
      if (user.role === 'admin' && input.role !== 'admin') {
        await this.assertRemainingAdmins(id);
      }
      user.role = input.role;
    }
    return this.toDto(await this.repo.save(user));
  }

  async remove(id: number, currentId: number): Promise<void> {
    if (id === currentId) {
      throw new ForbiddenException('No puedes eliminarte a ti mismo');
    }
    const user = await this.findOne(id);
    if (user.role === 'admin') {
      await this.assertRemainingAdmins(id);
    }
    await this.repo.remove(user);
  }

  private async assertRemainingAdmins(excludeId: number): Promise<void> {
    const count = await this.repo
      .createQueryBuilder('u')
      .where('u.role = :role AND u.id != :excludeId', { role: 'admin', excludeId })
      .getCount();
    if (count === 0) {
      throw new ForbiddenException('No se puede quitar el último administrador');
    }
  }

  private hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}