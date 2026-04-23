import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Header,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('categories')
  listCategories() {
    return this.blogService.findCategories();
  }

  @Get('posts/recent')
  listRecent(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 3;
    return this.blogService.findRecentPublished(Number.isNaN(n) ? 3 : n);
  }

  @Get('posts')
  listPublished(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.blogService.findPublishedPosts({ category, search });
  }

  @Get('posts/:slug')
  getPublishedBySlug(@Param('slug') slug: string) {
    return this.blogService.findPublishedBySlug(slug);
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  async getSitemap() {
    const { vehicles, posts, dealers } = await this.blogService.getSitemapData();
    const baseUrl = process.env.FRONTEND_URL || 'https://seunovocarro.com.br';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/veiculos</loc>
    <priority>0.9</priority>
  </url>
`;

    vehicles.forEach((v) => {
      xml += `  <url>
    <loc>${baseUrl}/veiculo/${v.slug}</loc>
    <lastmod>${v.updated_at.toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>\n`;
    });

    dealers.forEach((d) => {
      xml += `  <url>
    <loc>${baseUrl}/loja/${d.slug}</loc>
    <priority>0.7</priority>
  </url>\n`;
    });

    posts.forEach((p) => {
      xml += `  <url>
    <loc>${baseUrl}/blog/${p.slug}</loc>
    <lastmod>${p.updated_at.toISOString().split('T')[0]}</lastmod>
    <priority>0.6</priority>
  </url>\n`;
    });

    xml += `</urlset>`;

    return xml;
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/categories')
  adminCategories(@CurrentUser() user: User) {
    return this.blogService.findCategoriesAdmin(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/posts')
  adminList(@CurrentUser() user: User) {
    return this.blogService.findAllPostsAdmin(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/posts/:id')
  adminOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.blogService.findOnePostAdmin(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/posts')
  adminCreate(@CurrentUser() user: User, @Body() body: CreateBlogPostDto) {
    return this.blogService.createPost(user, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/posts/:id')
  adminUpdate(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateBlogPostDto,
  ) {
    return this.blogService.updatePost(user, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/posts/:id')
  adminDelete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.blogService.deletePost(user, id);
  }
}
