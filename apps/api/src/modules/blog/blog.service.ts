import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BlogPostStatus, Prisma } from '@prisma/client';
import type { User } from '@prisma/client';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';
import { CreateBlogCategoryDto } from './dto/blog-category.dto';

const DEFAULT_CATEGORIES: { name: string; slug: string; color: string }[] = [
  { name: 'Dicas', slug: 'dicas', color: '#22c55e' },
  { name: 'Financiamento', slug: 'financiamento', color: '#3b82f6' },
  { name: 'Rankings', slug: 'rankings', color: '#a855f7' },
  { name: 'Manutenção', slug: 'manutencao', color: '#f59e0b' },
  { name: 'Tecnologia', slug: 'tecnologia', color: '#06b6d4' },
];

function normalizeKeywords(input: string | undefined): string[] {
  if (!input?.trim()) return [];
  return input
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

function readingTimeFromContent(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function slugifyCategoryName(value: string): string {
  const s = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return s || 'categoria';
}

const publicPostInclude = {
  category: true,
  author: { select: { full_name: true, avatar_url: true } },
} as const;

function mapPublicPost(post: any) {
  return {
    ...post,
    tags: [],
    cover_image: post.featured_image ?? null,
  };
}

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async ensureDefaultCategories() {
    for (const c of DEFAULT_CATEGORIES) {
      await this.prisma.blogCategory.upsert({
        where: { slug: c.slug },
        create: { name: c.name, slug: c.slug, color: c.color },
        update: { name: c.name, color: c.color },
      });
    }
  }

  async findCategories() {
    await this.ensureDefaultCategories();
    return this.prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findCategoriesAdmin(user: User) {
    this.assertAdmin(user);
    return this.findCategories();
  }

  async createCategoryAdmin(user: User, dto: CreateBlogCategoryDto) {
    this.assertAdmin(user);
    const name = dto.name.trim();
    if (!name) {
      throw new BadRequestException('Nome é obrigatório.');
    }

    const baseSlug = (dto.slug?.trim().toLowerCase() || slugifyCategoryName(name)).replace(
      /^-+|-+$/g,
      '',
    );
    if (!baseSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(baseSlug)) {
      throw new BadRequestException('Slug inválido. Use apenas letras minúsculas, números e hífens.');
    }

    let slug = baseSlug;
    let counter = 1;
    while (await this.prisma.blogCategory.findUnique({ where: { slug } })) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
      if (counter > 100) {
        throw new ConflictException('Não foi possível gerar um slug único para a categoria.');
      }
    }

    const color = dto.color?.trim() || '#3B82F6';

    try {
      return await this.prisma.blogCategory.create({
        data: {
          name,
          slug,
          color,
          description: dto.description?.trim() || null,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Já existe uma categoria com este slug.');
      }
      throw e;
    }
  }

  async findPublishedPosts(filters?: { category?: string; search?: string }) {
    const where: Prisma.BlogPostWhereInput = {
      status: BlogPostStatus.published,
      published_at: { not: null },
    };

    if (filters?.category) {
      where.category = { slug: filters.category };
    }

    if (filters?.search?.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.blogPost.findMany({
      where,
      orderBy: { published_at: 'desc' },
      include: publicPostInclude,
    });
    return rows.map(mapPublicPost);
  }

  async findRecentPublished(limit: number) {
    const take = Math.min(Math.max(limit || 3, 1), 20);
    const rows = await this.prisma.blogPost.findMany({
      where: { status: BlogPostStatus.published, published_at: { not: null } },
      orderBy: { published_at: 'desc' },
      take,
      include: publicPostInclude,
    });
    return rows.map(mapPublicPost);
  }

  async findPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        status: BlogPostStatus.published,
        published_at: { not: null },
      },
      include: publicPostInclude,
    });
    if (!post) throw new NotFoundException('Artigo não encontrado');
    return mapPublicPost(post);
  }

  async getSitemapData() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { status: 'approved' },
      select: { slug: true, updated_at: true },
    });

    const posts = await this.prisma.blogPost.findMany({
      where: { status: BlogPostStatus.published, published_at: { not: null } },
      select: { slug: true, updated_at: true },
    });

    const dealers = await this.prisma.dealer.findMany({
      select: { slug: true, created_at: true },
    });

    return { vehicles, posts, dealers };
  }

  private assertAdmin(user: User) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
  }

  async findAllPostsAdmin(user: User) {
    this.assertAdmin(user);
    await this.ensureDefaultCategories();
    return this.prisma.blogPost.findMany({
      orderBy: { updated_at: 'desc' },
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
    });
  }

  async findOnePostAdmin(user: User, id: string) {
    this.assertAdmin(user);
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, full_name: true, email: true } },
      },
    });
    if (!post) throw new NotFoundException('Artigo não encontrado');
    return post;
  }

  async createPost(user: User, dto: CreateBlogPostDto) {
    this.assertAdmin(user);
    const slug = dto.slug.trim().toLowerCase();
    const clash = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (clash) {
      throw new ConflictException('Já existe um artigo com este slug. Altere o slug.');
    }

    const published_at =
      dto.status === BlogPostStatus.published ? new Date() : null;

    const reading =
      dto.reading_time_minutes && dto.reading_time_minutes > 0
        ? dto.reading_time_minutes
        : readingTimeFromContent(dto.content);

    try {
      return await this.prisma.blogPost.create({
        data: {
          title: dto.title.trim(),
          slug,
          content: dto.content,
          excerpt: dto.excerpt?.trim() || null,
          featured_image: dto.featured_image?.trim() || null,
          featured_image_alt: dto.featured_image_alt?.trim() || null,
          category_id: dto.category_id || null,
          status: dto.status,
          published_at,
          meta_title: dto.meta_title?.trim() || null,
          meta_description: dto.meta_description?.trim() || null,
          meta_keywords: normalizeKeywords(dto.meta_keywords),
          reading_time_minutes: reading,
          author_id: user.id,
        },
        include: {
          category: true,
          author: { select: { id: true, full_name: true, email: true } },
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Slug ou outro campo único já está em uso.');
      }
      throw e;
    }
  }

  async updatePost(user: User, id: string, dto: UpdateBlogPostDto) {
    this.assertAdmin(user);
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Artigo não encontrado');

    const nextSlug = dto.slug !== undefined ? dto.slug.trim().toLowerCase() : undefined;
    if (nextSlug && nextSlug !== existing.slug) {
      const clash = await this.prisma.blogPost.findUnique({ where: { slug: nextSlug } });
      if (clash) {
        throw new ConflictException('Já existe um artigo com este slug.');
      }
    }

    let published_at: Date | null | undefined = undefined;
    if (dto.status !== undefined) {
      if (dto.status === BlogPostStatus.published) {
        published_at = existing.published_at ?? new Date();
      } else {
        published_at = null;
      }
    }

    const data: Prisma.BlogPostUncheckedUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (nextSlug !== undefined) data.slug = nextSlug;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt?.trim() || null;
    if (dto.featured_image !== undefined) {
      data.featured_image = dto.featured_image?.trim() || null;
    }
    if (dto.featured_image_alt !== undefined) {
      data.featured_image_alt = dto.featured_image_alt?.trim() || null;
    }
    if (dto.category_id !== undefined) {
      data.category_id = dto.category_id || null;
    }
    if (dto.status !== undefined) data.status = dto.status;
    if (published_at !== undefined) data.published_at = published_at;
    if (dto.meta_title !== undefined) data.meta_title = dto.meta_title?.trim() || null;
    if (dto.meta_description !== undefined) {
      data.meta_description = dto.meta_description?.trim() || null;
    }
    if (dto.meta_keywords !== undefined) {
      data.meta_keywords = normalizeKeywords(dto.meta_keywords);
    }
    if (dto.reading_time_minutes !== undefined) {
      data.reading_time_minutes = dto.reading_time_minutes;
    } else if (dto.content !== undefined) {
      data.reading_time_minutes = readingTimeFromContent(dto.content);
    }

    if (Object.keys(data).length === 0) {
      return this.findOnePostAdmin(user, id);
    }

    try {
      return await this.prisma.blogPost.update({
        where: { id },
        data,
        include: {
          category: true,
          author: { select: { id: true, full_name: true, email: true } },
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Slug ou outro campo único já está em uso.');
      }
      throw e;
    }
  }

  async deletePost(user: User, id: string) {
    this.assertAdmin(user);
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Artigo não encontrado');
    await this.prisma.blogPost.delete({ where: { id } });
    return { ok: true };
  }
}
