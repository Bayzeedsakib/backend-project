import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Moderator } from '../entities/moderator.entity';
import * as bcrypt from 'bcrypt';
import { CreateModeratorDto } from '../moderators/dto/create-moderator.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Moderator)
    private readonly modRepo: Repository<Moderator>,
    private readonly jwtService: JwtService,
  ) {}

  //  Register moderator

  async register(dto: CreateModeratorDto) {
    const existing = await this.modRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const moderator = this.modRepo.create({
      ...dto,
      password: hashedPassword,
    });

    await this.modRepo.save(moderator);

    return { message: 'Registration successful' };
  }

  //  Login & return JWT

  async login(dto: LoginDto) {
    const user = await this.modRepo.findOne({ where: { email: dto.email } });

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      message: 'Login successful',
      access_token: token,
    };
  }
}
