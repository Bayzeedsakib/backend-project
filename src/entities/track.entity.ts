import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Moderator } from './moderator.entity';
import { Playlist } from './playlist.entity';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 }) // specify type
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  artist?: string;

  // OneToMany from moderator side
  @ManyToOne(() => Moderator, (moderator) => moderator.tracks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  moderator: Moderator;

  // ManyToMany with playlists
  @ManyToMany(() => Playlist, (playlist) => playlist.tracks)
  @JoinTable()
  playlists: Playlist[];
}
