import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: User) {
    return this.chatService.getUserConversations(user.id);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') conversationId: string, @CurrentUser() user: User) {
    return this.chatService.getConversationMessages(conversationId, user.id);
  }
}
