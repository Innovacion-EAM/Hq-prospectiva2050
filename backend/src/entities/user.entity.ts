import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'admin' | 'editor';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'varchar', default: 'editor' })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}