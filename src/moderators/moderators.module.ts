import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Moderator } from 'src/entities/moderator.entity';
import { Playlist } from 'src/entities/playlist.entity';
import { Profile } from 'src/entities/profile.entity';
import { Track } from 'src/entities/track.entity';
import { ModeratorsController } from './moderators.controller';
import { ModeratorsService } from './moderators.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Moderator, Profile, Track, Playlist]),
    AuthModule,
  ],
  controllers: [ModeratorsController],
  providers: [ModeratorsService],
})
export class ModeratorsModule {}
