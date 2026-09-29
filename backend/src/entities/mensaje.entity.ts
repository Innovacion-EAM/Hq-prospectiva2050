import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  /**
   * Canal para devolver una respuesta, si la persona dejó uno.
   *
   * Es nullable a propósito: la caja «Pregunta o recomendación» del hero es
   * anónima, así que la mayoría llegan sin correo. Antes se rellenaba con
   * `anonimo@prospectiva.local`, una dirección inventada que el backoffice
   * acababa mostrando como si fuera real y contra la cual nadie podía escribir.
   * Ahora la ausencia se guarda como ausencia, y el backoffice dice «Sin contacto».
   */
  @Column({ type: 'varchar', nullable: true })
  email: string | null;

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

  /**
   * En qué punto del ciclo de atención está. Lo mueve el backoffice, no la
   * ciudadanía: `nuevo` al llegar, `en_revision` mientras lo miran,
   * `respondido` cuando ya se contestó y `archivado` al cerrarlo.
   *
   * El `DEFAULT 'nuevo'` pone en la misma situación a los mensajes anteriores
   * a esta columna: ninguno ha sido atendido todavía.
   */
  @Column({ type: 'varchar', length: 20, default: 'nuevo' })
  estado: string;

  /**
   * Anotación interna de qué se hizo con el mensaje. Es un diario del equipo,
   * no una respuesta enviada a la ciudadanía: el sistema no manda correos, así
   * que aquí queda escrito a quién se le contestó, por qué canal y cuándo.
   */
  @Column({ type: 'text', nullable: true })
  seguimiento: string | null;
}