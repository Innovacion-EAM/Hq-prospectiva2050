import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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

/**
 * Límites de longitud de la contraseña.
 *
 * 8 es el mínimo razonable sin volverse molesto. 200 es el techo: por encima
 * de ~72 bytes bcrypt deja de mirar el resto, así que sin un límite explícito
 * dos contraseñas distintas que compartan prefijo serían la misma.
 */
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;

/**
 * Contraseñas que aparecen en cualquier filtración de datos publicados. No es
 * una lista de las mejores contraseñas del mundo: es una lista pequeña de las
 * que ya se han robado de verdad, y son las que se prueban primero.
 *
 * Solo alimenta el mensaje de error, no la seguridad: contra un ataque de
 * fuerza bruta mandan los límites de peticiones y el coste de bcrypt.
 */
const COMMON_PASSWORDS = new Set([
  'password',
  'contrasena',
  'contraseña',
  'admin123',
  'administrador',
  'qwerty123',
  '12345678',
  '123456789',
  'abc12345',
  'password1',
  'iloveyou',
  'prospectiva',
  'horizonte',
  'quindio',
]);

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

  /**
   * Cambia la contraseña de un usuario exigiendo la actual.
   *
   * Exigir la actual es lo que separa esto de una escalada de privilegios:
   * sin ella, cualquiera que encuentre un token robado (o que se le quede el
   * ordenador abierto en el panel) podría cambiar la contraseña y quedarse con
   * la cuenta para siempre. Con ella hace falta la contraseña, que es lo único
   * que no se puede robar desde el navegador.
   *
   * @param userId          la cuenta que se cambia (la del token)
   * @param currentPassword la contraseña que el usuario cree tener ahora
   * @param newPassword     la que quiere poner
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<UserDto> {
    const user = await this.findOne(userId);

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      // 401 y no 400: la contraseña actual es una credencial. Además el
      // mensaje no revela si la cuenta existe (eso ya lo dice el 404).
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'La contraseña nueva debe ser distinta de la actual',
      );
    }

    this.assertPasswordAcceptable(newPassword);

    user.passwordHash = await this.hash(newPassword);
    return this.toDto(await this.repo.save(user));
  }

  /**
   * Rechaza contraseñas que no sirven de nada, con un motivo concreto para que
   * el usuario sepa qué arreglar en vez de ver un error genérico.
   *
   * Se comprueba contra una lista de contraseñas filtradas habituales en lugar
   * de exigir símbolos: una regla que obliga a poner un `!` convierte
   * "correcto-caballo-battery" en "correcto-caballo-battery1!", que es peor.
   * Lo que protege de verdad es la longitud.
   */
  private assertPasswordAcceptable(password: string): void {
    if (typeof password !== 'string' || password.length === 0) {
      throw new BadRequestException('La contraseña no puede estar vacía');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      );
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      // bcrypt solo mira los primeros 72 bytes. Sin este tope, todo lo que
      // pase de ahí se trunca en silencio, y dos contraseñas distintas que
      // compartan los primeros 72 caracteres serían la misma.
      throw new BadRequestException(
        `La contraseña no puede pasar de ${MAX_PASSWORD_LENGTH} caracteres`,
      );
    }
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      throw new BadRequestException(
        'Esa contraseña es demasiado común. Elige otra.',
      );
    }
  }

  private hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}