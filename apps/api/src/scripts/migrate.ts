import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

// Recomenda-se rodar este script via 'npx ts-node' com as envs setadas:
// SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... DATABASE_URL=...

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function migrateData() {
  console.log('--- Iniciando Migração Supabase -> Prisma ---');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
    process.exit(1);
  }

  try {
    // 1. Puxar Users e Profiles para fundir na nova tabela "users" e "dealers"
    console.log('Migrando Perfis (Users/Dealers)...');
    const { data: profiles, error: errProfiles } = await supabase.from('profiles').select('*');
    if (errProfiles) throw errProfiles;

    for (const p of profiles || []) {
      // Create user
      const user = await prisma.user.create({
        data: {
          id: p.id,
          email: p.email || `${p.id}@migrated.invalid`, // fallback se auth.users não for acessível diretamente (sem admin api)
          password_hash: '$2b$10$not_real_hash_needs_reset', // Força reset se não temos os hashes
          full_name: p.full_name || 'Usuário',
          phone: p.phone || '',
          whatsapp: p.whatsapp || '',
          avatar_url: p.avatar_url || '',
          city: p.city || '',
          state: p.state || '',
          role: p.dealer_name ? 'editor' : 'user', // Lógica básica de atribuição de roles. Se tiver dealer_name, consideramos Vendedor (editor/dealer)
          status: 'active',
          created_at: new Date(p.created_at || Date.now()),
        }
      });

      // Se é lojista, criar a tabela Dealer vinculada
      if (p.dealer_name || p.dealer_slug) {
        await prisma.dealer.create({
          data: {
            user_id: user.id,
            name: p.dealer_name || p.full_name,
            slug: p.dealer_slug || `dealer-${user.id}`,
            cnpj: p.dealer_cnpj || `0000000000000${Math.floor(Math.random()*9)}`,
            description: p.dealer_description || '',
            address: p.dealer_address || '',
            logo_url: p.dealer_logo || '',
            banner_url: p.dealer_banner || '',
            website: p.dealer_website || '',
            instagram: p.dealer_instagram || '',
            facebook: p.dealer_facebook || '',
            working_hours: p.dealer_working_hours || {},
            verified: p.is_dealer_verified || false,
            featured: false,
            since: new Date(p.created_at || Date.now()),
            created_at: new Date(p.created_at || Date.now()),
          }
        });
      }
    }
    console.log(`✅ ${profiles?.length || 0} Usuários/Lojistas importados.`);

    // 2. Veículos
    console.log('Migrando Veículos...');
    const { data: vehicles, error: errVeh } = await supabase.from('vehicles').select('*');
    if (errVeh) throw errVeh;

    for (const v of vehicles || []) {
      await prisma.vehicle.create({
        data: {
          id: v.id,
          user_id: v.user_id,
          brand: v.brand,
          model: v.model,
          version: v.version || '',
          year: v.year,
          mileage: v.mileage,
          transmission: v.transmission || 'Manual',
          fuel: v.fuel || 'Flex',
          color: v.color || 'Branco',
          doors: v.doors || 4,
          plate_ending: v.plate_ending || '0',
          price: v.price || 0,
          description: v.description || '',
          city: v.city || '',
          state: v.state || '',
          phone: v.phone || '',
          whatsapp: v.whatsapp || '',
          status: v.status || 'draft',
          slug: v.slug || `vehicle-${v.id}`,
          display_id: v.display_id || '',
          ad_code: v.ad_code || '',
          view_count: v.view_count || 0,
          created_at: new Date(v.created_at || Date.now()),
          updated_at: new Date(v.updated_at || Date.now()),
        }
      });
    }
    console.log(`✅ ${vehicles?.length || 0} Veículos importados.`);

    // 3. Media dos veículos
    console.log('Migrando Fotos dos Veículos...');
    const { data: media, error: errMedia } = await supabase.from('vehicle_media').select('*');
    if (errMedia) throw errMedia;
    
    // Batch insert simplificado
    for (const m of media || []) {
      await prisma.vehicleMedia.create({
        data: {
          id: m.id,
          vehicle_id: m.vehicle_id,
          url: m.url,
          type: m.type || 'image',
          order: m.order || 0
        }
      });
    }
    console.log(`✅ ${media?.length || 0} Mídias importadas.`);

    // 4. Leads
    console.log('Migrando Leads...');
    const { data: leads, error: errLeads } = await supabase.from('leads').select('*');
    if (errLeads) throw errLeads;
    
    for (const l of leads || []) {
      await prisma.lead.create({
        data: {
          id: l.id,
          vehicle_id: l.vehicle_id,
          name: l.name || 'Anônimo',
          phone: l.phone || '',
          email: l.email || '',
          source: l.source || 'website',
          utm_source: l.utm_source || '',
          utm_medium: l.utm_medium || '',
          utm_campaign: l.utm_campaign || '',
          created_at: new Date(l.created_at || Date.now()),
        }
      });
    }
    console.log(`✅ ${leads?.length || 0} Leads importados.`);

    // Nota: Demais entidades como blogs, métricas, etc., seguem a lógica 1 para 1. 

    console.log('🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
