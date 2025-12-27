import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ModeratorsService } from './moderators.service';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { UpdateModeratorDto } from './dto/update-moderator.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('moderators')
export class ModeratorsController {
  constructor(private readonly moderatorsService: ModeratorsService) {}

  // Public: create/register moderator
  @Post()
  async create(@Body() dto: CreateModeratorDto) {
    return this.moderatorsService.createModerator(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.moderatorsService.findAll();
  }

  // Get moderator by id
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moderatorsService.findById(id);
  }

  // Update Mod
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModeratorDto,
  ) {
    return this.moderatorsService.updateModerator(id, dto);
  }

  // Patch status Moderator
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async patchStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'active' | 'inactive',
  ) {
    return this.moderatorsService.patchStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.moderatorsService.remove(id);
  }

  // ----------------- Track (OneToMany) -----------------

  // Create a track for a moderator
  @UseGuards(JwtAuthGuard)
  @Post(':id/tracks')
  async addTrack(
    @Param('id', ParseIntPipe) moderatorId: number,
    @Body('title') title: string,
    @Body('artist') artist?: string,
  ) {
    return this.moderatorsService.addTrack(moderatorId, title, artist);
  }

  // Get Tracks by Mod id
  @UseGuards(JwtAuthGuard)
  @Get(':id/tracks')
  async getTracks(@Param('id', ParseIntPipe) moderatorId: number) {
    const mod = await this.moderatorsService.findById(moderatorId);
    return (mod as any).tracks ?? [];
  }

  // Delete a single track
  @UseGuards(JwtAuthGuard)
  @Delete('tracks/:trackId')
  async deleteTrack(@Param('trackId', ParseIntPipe) trackId: number) {
    return this.moderatorsService.deleteTrack(trackId);
  }

  // ----------------- Playlist (ManyToMany) -----------------

  // Create playlist and attach track ids
  @UseGuards(JwtAuthGuard)
  @Post('playlists')
  async createPlaylist(
    @Body('name') name: string,
    @Body('trackIds') trackIds: number[] = [],
  ) {
    return this.moderatorsService.createPlaylistWithTrack(name, trackIds);
  }

  // Add existing track to existing playlist:
  @UseGuards(JwtAuthGuard)
  @Post('playlists/:playlistId/tracks/:trackId')
  async addTrackToPlaylist(
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @Param('trackId', ParseIntPipe) trackId: number,
  ) {
    return this.moderatorsService.addTrackToPlaylist(playlistId, trackId);
  }

  // Get playList by id
  @UseGuards(JwtAuthGuard)
  @Get('playlists/:playlistId')
  async getPlaylistById(@Param('playlistId', ParseIntPipe) playListId: number) {
    return this.moderatorsService.getPlaylistById(playListId);
  }

  // Remove track from playlist:
  @UseGuards(JwtAuthGuard)
  @Delete('playlists/:playlistId/tracks/:trackId')
  async removeTrackFromPlaylist(
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @Param('trackId', ParseIntPipe) trackId: number,
  ) {
    return this.moderatorsService.removeTrackFromPlaylist(playlistId, trackId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('playlists/:trackId')
  async gettPlaylistById(@Param('trackId', ParseIntPipe) trackId: number) {
    return this.moderatorsService.gettPlaylistById(trackId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('trackId/:playlistId')
  async getttPlaylistById(@Param('trackId', ParseIntPipe) trackId: number) {
    return this.moderatorsService.getttPlaylistById(trackId);
  }
}
