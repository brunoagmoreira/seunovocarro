import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})], // For verifying tokens in the WS Gateway
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
