import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Moderator } from '../entities/moderator.entity';
import { Profile } from '../entities/profile.entity';
import { Track } from '../entities/track.entity';
import { Playlist } from '../entities/playlist.entity';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { UpdateModeratorDto } from './dto/update-moderator.dto';

@Injectable()
export class ModeratorsService {
  constructor(
    @InjectRepository(Moderator) private modRepo: Repository<Moderator>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Track) private trackRepo: Repository<Track>,
    @InjectRepository(Playlist) private playlistRepo: Repository<Playlist>,
  ) {}

  async createModerator(dto: CreateModeratorDto): Promise<Partial<Moderator>> {
    // check duplicate email
    const exists = await this.modRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const moderator = this.modRepo.create({
      email: dto.email,
      password: hashed,
      status: 'active',
    });

    if (dto.displayName || dto.bio) {
      const profile = this.profileRepo.create({
        displayName: dto.displayName,
        bio: dto.bio,
      });
      moderator.profile = profile;
    }

    try {
      const saved = await this.modRepo.save(moderator);
      const { password, ...rest } = saved as any;
      return rest;
    } catch (err) {
      throw new InternalServerErrorException('Failed to create moderator');
    }
  }

  // List all moderators (includes relations)
  async findAll(): Promise<Partial<Moderator>[]> {
    const mods = await this.modRepo.find({ relations: ['profile', 'tracks'] });
    return mods.map((m) => {
      const { password, ...rest } = m as any;
      return rest;
    });
  }

  // Find single moderator by id
  async findById(id: number): Promise<Partial<Moderator>> {
    const m = await this.modRepo.findOne({
      where: { id },
      relations: ['profile', 'tracks'],
    });
    if (!m) throw new NotFoundException('Moderator not found');
    const { password, ...rest } = m as any;
    return rest;
  }

  // Update moderator
  async updateModerator(
    id: number,
    dto: UpdateModeratorDto,
  ): Promise<Partial<Moderator>> {
    const m = await this.modRepo.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!m) throw new NotFoundException('Moderator not found');

    if (dto.password) {
      m.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.status) {
      if (dto.status !== 'active' && dto.status !== 'inactive') {
        throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
      }
      m.status = dto.status;
    }

    // Profile handling: create if missing, otherwise update fields
    if (!m.profile && (dto.displayName || dto.bio)) {
      m.profile = this.profileRepo.create({
        displayName: dto.displayName,
        bio: dto.bio,
      });
    } else if (m.profile) {
      if (dto.displayName !== undefined)
        m.profile.displayName = dto.displayName;
      if (dto.bio !== undefined) m.profile.bio = dto.bio;
    }

    try {
      const saved = await this.modRepo.save(m);
      const { password, ...rest } = saved as any;
      return rest;
    } catch (err) {
      throw new InternalServerErrorException('Failed to update moderator');
    }
  }

  // Patch only the status field
  async patchStatus(
    id: number,
    status: 'active' | 'inactive',
  ): Promise<Partial<Moderator>> {
    const m = await this.modRepo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Moderator not found');
    if (status !== 'active' && status !== 'inactive') {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }
    m.status = status;
    const saved = await this.modRepo.save(m);
    const { password, ...rest } = saved as any;
    return rest;
  }

  // Remove moderator
  async remove(id: number): Promise<{ deleted: boolean }> {
    const m = await this.modRepo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Moderator not found');
    await this.modRepo.remove(m);
    return { deleted: true };
  }

  // ----------------- Relationship helpers -----------------

  // Add a track under a moderator (OneToMany)
  async addTrack(
    moderatorId: number,
    title: string,
    artist?: string,
  ): Promise<Track> {
    const mod = await this.modRepo.findOne({ where: { id: moderatorId } });
    if (!mod) throw new NotFoundException('Moderator not found');

    const payload: Partial<Track> = {
      title,
      artist: artist ?? undefined,
      moderator: mod,
    };

    const track = this.trackRepo.create(payload as DeepPartial<Track>);
    return this.trackRepo.save(track);
  }

  // Create a playlist and attach existing tracks (ManyToMany)
  async createPlaylistWithTrack(
    playlistName: string,
    trackIds: number[] = [],
  ): Promise<Playlist> {
    let tracks: Track[] = [];
    if (trackIds.length > 0) {
      tracks = await this.trackRepo.find({ where: { id: In(trackIds) } });
      // ensure all requested tracks were found
      const foundIds = tracks.map((t) => t.id);
      const missing = trackIds.filter((id) => !foundIds.includes(id));
      if (missing.length > 0) {
        throw new NotFoundException(`Tracks not found: ${missing.join(',')}`);
      }
    }

    const playlist = this.playlistRepo.create({ name: playlistName, tracks });
    return this.playlistRepo.save(playlist);
  }

  // Add an existing track to an existing playlist (ManyToMany update)
  async addTrackToPlaylist(
    playlistId: number,
    trackId: number,
  ): Promise<Playlist> {
    const playlist = await this.playlistRepo.findOne({
      where: { id: playlistId },
      relations: ['tracks'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');

    const track = await this.trackRepo.findOne({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found');

    if (!playlist.tracks) playlist.tracks = [];
    const exists = playlist.tracks.some((t) => t.id === track.id);
    if (!exists) {
      playlist.tracks.push(track);
      return this.playlistRepo.save(playlist);
    }

    return playlist;
  }

  async getPlaylistById(playlistId: number): Promise<Playlist> {
    const playlist = await this.playlistRepo.findOne({
      where: { id: playlistId },
      relations: ['tracks'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');

    return playlist;
  }

  // Remove a track from a playlist (ManyToMany delete)
  async removeTrackFromPlaylist(
    playlistId: number,
    trackId: number,
  ): Promise<Playlist> {
    const playlist = await this.playlistRepo.findOne({
      where: { id: playlistId },
      relations: ['tracks'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');

    if (!playlist.tracks || playlist.tracks.length === 0) return playlist;

    playlist.tracks = playlist.tracks.filter((t) => t.id !== trackId);
    return this.playlistRepo.save(playlist);
  }

  // Delete a track by id
  async deleteTrack(trackId: number): Promise<{ deleted: boolean }> {
    const track = await this.trackRepo.findOne({
      where: { id: trackId },
      relations: ['playlists'],
    });
    if (!track) throw new NotFoundException('Track not found');

    if (track.playlists && track.playlists.length) {
      track.playlists = [];
      await this.trackRepo.save(track);
    }

    await this.trackRepo.remove(track);
    return { deleted: true };
  }

  async gettPlaylistById(playlistId: number): Promise<Playlist> {
    const playlist = await this.playlistRepo.findOne({
      where: { id: playlistId },
      relations: ['tracks'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');

    return playlist;
  }

  async getttPlaylistById(trackId: number): Promise<Playlist> {
    const playlist = await this.playlistRepo.findOne({
      where: { id: trackId },
      relations: ['tracks'],
    });
    if (!playlist) throw new NotFoundException('Playlist not found');

    return playlist;
  }
}
