import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('config_entidades')
export class Entidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
}