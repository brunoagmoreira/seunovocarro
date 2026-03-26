import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Armazena quem está conectado: socketId -> userId
  private connectedClients = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extrai token dos headers ou query
      const authHeader = client.handshake.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : client.handshake.auth.token;

      if (!token) throw new Error('Token ausente');

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret-trocar-em-producao',
      });

      // Salva socket -> userId
      this.connectedClients.set(client.id, payload.sub);

      // Entra em uma sala baseada no ID do usuário para facilitar envio direto
      await client.join(`user_${payload.sub}`);
      
      console.log(`📡 Usuário ${payload.sub} conectado no Socket ${client.id}`);
    } catch (error) {
      console.log(`❌ Conexão negada para socket ${client.id}: Token inválido`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    this.connectedClients.delete(client.id);
    if (userId) {
      console.log(`📡 Usuário ${userId} desconectado`);
    }
  }

  // Usuário entra na sala de uma conversa específica (para chat aberto)
  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody('conversationId') conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conv_${conversationId}`);
    return { event: 'joined', conversationId };
  }

  // Enviar mensagem
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.connectedClients.get(client.id);
    if (!userId) return { error: 'Usuário não autenticado' };

    try {
      // Salva no banco
      const message = await this.chatService.saveMessage(sendMessageDto, userId);

      // Informa para a sala da conversa
      this.server.to(`conv_${sendMessageDto.conversation_id}`).emit('newMessage', message);
      
      return message;
    } catch (error) {
      return { error: 'Não foi possível enviar a mensagem' };
    }
  }
}
