import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Track } from './track.entity';

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Track, (track) => track.playlists)
  tracks: Track[];
}
