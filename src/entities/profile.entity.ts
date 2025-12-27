import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Moderator } from './moderator.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  bio: string;

  @OneToOne(() => Moderator, (moderator) => moderator.profile)
  moderator: Moderator;
}
