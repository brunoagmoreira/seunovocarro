import { Controller, Get, Header } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  findAllPosts() {
    return this.blogService.findAllPosts();
  }

  // Substitui a Edge Function `sitemap`
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

    // Veículos
    vehicles.forEach(v => {
      xml += `  <url>
    <loc>${baseUrl}/veiculo/${v.slug}</loc>
    <lastmod>${v.updated_at.toISOString().split('T')[0]}</lastmod>
    <priority>0.8</priority>
  </url>\n`;
    });

    // Lojistas
    dealers.forEach(d => {
      xml += `  <url>
    <loc>${baseUrl}/loja/${d.slug}</loc>
    <priority>0.7</priority>
  </url>\n`;
    });

    // Blog
    posts.forEach(p => {
      xml += `  <url>
    <loc>${baseUrl}/blog/${p.slug}</loc>
    <lastmod>${p.updated_at.toISOString().split('T')[0]}</lastmod>
    <priority>0.6</priority>
  </url>\n`;
    });

    xml += `</urlset>`;

    return xml;
  }
}
