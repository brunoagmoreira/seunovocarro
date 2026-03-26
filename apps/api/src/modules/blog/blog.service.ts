import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findAllPosts() {
    return this.prisma.blogPost.findMany({
      where: { published_at: { not: null } },
      orderBy: { created_at: 'desc' },
      include: {
        category: true,
        author: { select: { full_name: true, avatar_url: true } }
      }
    });
  }

  async getSitemapData() {
    // Busca URLs de veículos
    const vehicles = await this.prisma.vehicle.findMany({
      where: { status: 'approved' },
      select: { slug: true, updated_at: true },
    });

    // Busca URLs do blog
    const posts = await this.prisma.blogPost.findMany({
      where: { published_at: { not: null } },
      select: { slug: true, updated_at: true },
    });

    // Busca URLs de lojistas
    const dealers = await this.prisma.dealer.findMany({
      select: { slug: true, created_at: true },
    });

    return { vehicles, posts, dealers };
  }
}
