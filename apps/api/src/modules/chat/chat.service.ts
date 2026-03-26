import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/chat.dto';
import { User } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getUserConversations(userId: string) {
    // Busca conversas onde o usuário é o seller ou o lead (baseado nos relacionamentos)
    // No nosso modelo atual, lead nao tem user_id atrelado diretamente, 
    // mas vamos retornar todas em que o seller_id = userId.
    // Em um cenário completo, o lead associado ao User poderia ser filtrado.
    return this.prisma.conversation.findMany({
      where: {
        seller_id: userId,
      },
      include: {
        vehicle: {
          select: { brand: true, model: true, year: true, slug: true },
        },
        lead: {
          select: { name: true, phone: true },
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1, // Last message
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    if (conversation.seller_id !== userId) {
      throw new ForbiddenException('Acesso negado a esta conversa');
    }

    return this.prisma.message.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' },
    });
  }

  async saveMessage(sendMessageDto: SendMessageDto, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: sendMessageDto.conversation_id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Cria a mensagem
    const message = await this.prisma.message.create({
      data: {
        conversation_id: sendMessageDto.conversation_id,
        content: sendMessageDto.content,
        sender_id: userId,
        sender_type: sendMessageDto.sender_type,
      },
    });

    // Atualiza o updated_at da conversa
    await this.prisma.conversation.update({
      where: { id: sendMessageDto.conversation_id },
      data: { updated_at: new Date() },
    });

    return message;
  }
}
