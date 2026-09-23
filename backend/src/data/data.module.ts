import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Convocatoria } from '../entities/convocatoria.entity';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Documento } from '../entities/documento.entity';
import { Entidad } from '../entities/entidad.entity';
import { Mensaje } from '../entities/mensaje.entity';
import { Noticia } from '../entities/noticia.entity';
import { PaginaProyecto } from '../entities/pagina-proyecto.entity';
import { SiteConfig } from '../entities/site-config.entity';
import { Stat } from '../entities/stat.entity';
import { Taller } from '../entities/taller.entity';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { ConvocatoriasController } from './convocatorias.controller';
import { ConvocatoriasService } from './convocatorias.service';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { FormsController } from './forms.controller';
import { MensajesController } from './mensajes.controller';
import { MensajesService } from './mensajes.service';
import { NoticiasController } from './noticias.controller';
import { NoticiasService } from './noticias.service';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Noticia,
      Documento,
      Convocatoria,
      Stat,
      Entidad,
      Taller,
      DocCategoria,
      PaginaProyecto,
      Dimension,
      Mensaje,
      SiteConfig,
    ]),
  ],
  controllers: [
    NoticiasController,
    DocumentosController,
    ConvocatoriasController,
    ConfigController,
    MensajesController,
    FormsController,
  ],
  providers: [
    NoticiasService,
    DocumentosService,
    ConvocatoriasService,
    MensajesService,
    ConfigService,
    SeederService,
  ],
})
export class DataModule {}