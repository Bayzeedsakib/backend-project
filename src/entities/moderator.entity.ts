import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Track } from './track.entity';

@Entity('moderators')
export class Moderator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'active' })
  status: 'active' | 'inactive';

  // OneToOne relation with Profile
  @OneToOne(() => Profile, (profile) => profile.moderator, { cascade: true })
  @JoinColumn()
  profile: Profile;

  // OneToMany: moderator moderates many tracks
  @OneToMany(() => Track, (track) => track.moderator, { cascade: true })
  tracks: Track[];
}
