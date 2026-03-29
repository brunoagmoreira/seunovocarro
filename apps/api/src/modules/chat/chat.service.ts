import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/chat.dto';
import { User } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getUserConversations(userId: string) {
    // Busca conversas onde o usuário é o seller OU o dono do lead (buyer)
    return this.prisma.conversation.findMany({
      where: {
        OR: [
          { seller_id: userId },
          { lead: { user_id: userId } }
        ]
      },
      include: {
        vehicle: {
          select: { 
            brand: true, 
            model: true, 
            year: true, 
            slug: true, 
            media: { take: 1, orderBy: { order: 'asc' } } 
          },
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
      include: { lead: true }
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const isSeller = conversation.seller_id === userId;
    const isBuyer = conversation.lead.user_id === userId;

    if (!isSeller && !isBuyer) {
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
      include: { lead: true }
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    const isSeller = conversation.seller_id === userId;
    const isBuyer = conversation.lead.user_id === userId;

    if (!isSeller && !isBuyer) {
      throw new ForbiddenException('Não autorizado a enviar mensagens nesta conversa');
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

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { lead: true }
    });

    if (!conversation) throw new NotFoundException('Conversa não encontrada');

    const isSeller = conversation.seller_id === userId;
    const isBuyer = conversation.lead.user_id === userId;

    if (!isSeller && !isBuyer) throw new ForbiddenException();

    // Se for o seller lendo, marca mensagens do lead como lidas
    const targetSenderType = isSeller ? 'lead' : 'seller';

    return this.prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        sender_type: targetSenderType,
        read_at: null
      },
      data: {
        read_at: new Date()
      }
    });
  }
}
