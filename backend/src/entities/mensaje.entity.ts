import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  asunto: string;

  @Column({ type: 'text', nullable: true })
  mensaje: string | null;

  @Column()
  tipo: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'boolean', default: false })
  leido: boolean;

  /**
   * El titular marcó la casilla de autorización del Aviso de Privacidad.
   *
   * Es la evidencia de que el consentimiento se pidió de verdad: los cuatro
   * DTOs de `forms.controller.ts` lo exigen, así que una fila con `true` llegó
   * con la casilla marcada. Las filas anteriores a la migración quedan en
   * `false` porque se recogieron antes de que existiera el aviso.
   */
  @Column({ type: 'boolean', default: false })
  consentimiento: boolean;
}