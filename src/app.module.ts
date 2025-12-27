import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeratorsModule } from './moderators/moderators.module';
import { AuthModule } from './auth/auth.module';
import { Moderator } from './entities/moderator.entity';
import { Profile } from './entities/profile.entity';
import { Track } from './entities/track.entity';
import { Playlist } from './entities/playlist.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ load .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        entities: [Moderator, Profile, Track, Playlist],
        synchronize: true,
      }),
    }),
    ModeratorsModule,
    AuthModule,
  ],
})
export class AppModule {}
