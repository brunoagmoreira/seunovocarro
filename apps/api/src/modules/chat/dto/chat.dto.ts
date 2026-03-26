import { IsString, IsEnum } from 'class-validator';
import { SenderType } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  conversation_id!: string;

  @IsString()
  content!: string;

  @IsEnum(SenderType)
  sender_type!: SenderType;
}
