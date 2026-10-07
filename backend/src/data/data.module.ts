import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Convocatoria } from '../entities/convocatoria.entity';
import { Dimension } from '../entities/dimension.entity';
import { DocCategoria } from '../entities/doc-categoria.entity';
import { Documento } from '../entities/documento.entity';
import { Mensaje } from '../entities/mensaje.entity';
import { Municipio } from '../entities/municipio.entity';
import { Noticia } from '../entities/noticia.entity';
import { PaginaProyecto } from '../entities/pagina-proyecto.entity';
import { RepositorioItem } from '../entities/repositorio-item.entity';
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
import { RepositorioController } from './repositorio.controller';
import { RepositorioImportService } from './repositorio-import.service';
import { RepositorioService } from './repositorio.service';
import { SeederService } from './seeder.service';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Noticia,
      Documento,
      Convocatoria,
      Stat,
      Municipio,
      Taller,
      DocCategoria,
      PaginaProyecto,
      Dimension,
      Mensaje,
      SiteConfig,
      RepositorioItem,
    ]),
  ],
  controllers: [
    NoticiasController,
    DocumentosController,
    ConvocatoriasController,
    ConfigController,
    MensajesController,
    FormsController,
    SiteController,
    RepositorioController,
  ],
  providers: [
    NoticiasService,
    DocumentosService,
    ConvocatoriasService,
    MensajesService,
    ConfigService,
    SeederService,
    SiteService,
    RepositorioService,
    RepositorioImportService,
  ],
})
export class DataModule {}