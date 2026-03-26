import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload/vehicle')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVehicleImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    if (!file.mimetype.includes('image')) {
      throw new BadRequestException('Apenas imagens são aceitas');
    }

    const url = await this.mediaService.uploadFile(file, 'vehicles');
    return { url };
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    if (!file.mimetype.includes('image')) throw new BadRequestException('Apenas imagens');

    const url = await this.mediaService.uploadFile(file, 'avatars');
    return { url };
  }
}
