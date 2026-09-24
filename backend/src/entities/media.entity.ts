import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  mime: string;

  @Column({ type: 'int' })
  size: number;

  @CreateDateColumn()
  createdAt: Date;
}