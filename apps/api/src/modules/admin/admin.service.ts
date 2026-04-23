import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { User } from '@prisma/client';
import { isSuperAdminEmail } from '../../common/auth/super-admin';
import type { UpdateSiteSettingsDto } from './dto/site-settings.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private readonly billingConfigSlug = 'dealer-billing-config';

  private async ensureDealerPlans() {
    const defaults = [
      {
        slug: 'dealer-plan-1',
        name: 'Plano 1',
        price: 0,
        max_vehicles: 3,
        xml_enabled: false,
        sdr_enabled: false,
        sdr_whatsapp: '',
      },
      {
        slug: 'dealer-plan-2',
        name: 'Plano 2',
        price: 199,
        max_vehicles: 999999,
        xml_enabled: true,
        sdr_enabled: false,
        sdr_whatsapp: '',
      },
      {
        slug: 'dealer-plan-3',
        name: 'Plano 3',
        price: 499,
        max_vehicles: 999999,
        xml_enabled: true,
        sdr_enabled: true,
        sdr_whatsapp: '',
      },
    ];

    for (const plan of defaults) {
      await this.prisma.adPlan.upsert({
        where: { slug: plan.slug },
        create: {
          slug: plan.slug,
          name: plan.name,
          plan_type: 'dealer',
          price: plan.price,
          daily_budget: 0,
          duration_days: 30,
          min_vehicles: 1,
          max_vehicles: plan.max_vehicles,
          features: {
            xml_enabled: plan.xml_enabled,
            sdr_enabled: plan.sdr_enabled,
            sdr_whatsapp: plan.sdr_whatsapp,
          } as any,
        },
        update: {
          plan_type: 'dealer',
        },
      });
    }
  }

  private async ensureBillingConfig() {
    await this.prisma.adPlan.upsert({
      where: { slug: this.billingConfigSlug },
      create: {
        slug: this.billingConfigSlug,
        name: 'Configuração Billing',
        plan_type: 'system',
        price: 0,
        daily_budget: 0,
        duration_days: 30,
        min_vehicles: 0,
        max_vehicles: 0,
        features: {
          asaas_enabled: false,
          asaas_api_url: 'https://api-sandbox.asaas.com',
          asaas_api_key: '',
          default_billing_type: 'CREDIT_CARD',
          default_frequency: 'monthly',
        } as any,
      },
      update: {
        plan_type: 'system',
      },
    });
  }

  private sanitizePhone(value?: string | null) {
    if (!value) return undefined;
    const digits = String(value).replace(/\D/g, '');
    return digits || undefined;
  }

  private async requestAsaas<T = any>(
    cfg: { asaas_api_key?: string; asaas_api_url?: string },
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const apiKey = (cfg.asaas_api_key || '').trim();
    const apiUrl = (cfg.asaas_api_url || 'https://api-sandbox.asaas.com').trim().replace(/\/$/, '');
    if (!apiKey) {
      throw new ForbiddenException('Token da API Asaas não configurado');
    }

    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
        ...(init?.headers || {}),
      },
    });

    const data = (await response.json().catch(() => ({}))) as any;
    if (!response.ok) {
      const message =
        data?.errors?.[0]?.description ||
        data?.errors?.[0]?.code ||
        'Falha ao comunicar com Asaas';
      throw new ForbiddenException(message);
    }
    return data as T;
  }

  checkAdmin(user: User) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
  }

  checkSuperAdmin(user: User) {
    if (!isSuperAdminEmail(user.email)) {
      throw new ForbiddenException('Acesso restrito a super administradores');
    }
  }

  async getDashboardStats(user: User) {
    this.checkAdmin(user);

    const [totalUsers, totalDealers, totalVehicles, totalLeads] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.dealer.count(),
      this.prisma.vehicle.count(),
      this.prisma.lead.count(),
    ]);

    return {
      users: totalUsers,
      dealers: totalDealers,
      vehicles: totalVehicles,
      leads: totalLeads,
    };
  }

  async listUsers(user: User) {
    this.checkAdmin(user);
    return this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        city: true,
        state: true,
        role: true,
        status: true,
        created_at: true,
        dealer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async listPendingSellerApprovals(user: User) {
    this.checkSuperAdmin(user);

    return this.prisma.user.findMany({
      where: {
        role: 'editor',
        status: 'pending',
      },
      orderBy: { created_at: 'asc' },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        city: true,
        state: true,
        created_at: true,
        dealer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async decideSellerApproval(
    user: User,
    targetUserId: string,
    decision: 'approve' | 'reject',
  ) {
    this.checkSuperAdmin(user);
    if (decision !== 'approve' && decision !== 'reject') {
      throw new ForbiddenException('Decisão inválida');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, status: true },
    });

    if (!target || target.role !== 'editor') {
      throw new ForbiddenException('Usuário alvo não é vendedor/lojista');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: decision === 'approve' ? 'active' : 'suspended',
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        status: true,
      },
    });
  }

  async listDealerPlans(user: User) {
    this.checkAdmin(user);
    await this.ensureDealerPlans();
    await this.ensureBillingConfig();

    const [plans, dealers, billingConfig] = await Promise.all([
      this.prisma.adPlan.findMany({
        where: { plan_type: { in: ['dealer', 'system'] } },
        orderBy: { created_at: 'asc' },
      }),
      this.prisma.dealer.findMany({
        include: {
          user: { select: { full_name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.adPlan.findUnique({ where: { slug: this.billingConfigSlug } }),
    ]);

    const billingFeatures = ((billingConfig?.features || {}) as any);
    return {
      billing_config: {
        asaas_enabled: Boolean(billingFeatures.asaas_enabled),
        asaas_api_url: billingFeatures.asaas_api_url || 'https://api-sandbox.asaas.com',
        asaas_api_key: billingFeatures.asaas_api_key || '',
        default_billing_type: billingFeatures.default_billing_type || 'CREDIT_CARD',
        default_frequency: billingFeatures.default_frequency || 'monthly',
      },
      plans: plans.filter((plan) => plan.plan_type === 'dealer').map((plan) => {
        const features = (plan.features || {}) as any;
        return {
          slug: plan.slug,
          name: plan.name,
          price: Number(plan.price || 0),
          duration_days: plan.duration_days,
          billing_enabled: features.billing_enabled ?? true,
          billing_frequency: features.billing_frequency || 'monthly',
          max_vehicles: plan.max_vehicles,
          xml_enabled: Boolean(features.xml_enabled),
          sdr_enabled: Boolean(features.sdr_enabled),
          sdr_whatsapp: features.sdr_whatsapp || '',
        };
      }),
      dealers: dealers.map((dealer) => {
        const metadata = (dealer.working_hours || {}) as any;
        const billing = (metadata.billing || {}) as any;
        return {
          id: dealer.id,
          name: dealer.name,
          slug: dealer.slug,
          owner_name: dealer.user?.full_name,
          owner_email: dealer.user?.email,
          plan_slug: metadata.dealer_plan_slug || 'dealer-plan-1',
          billing_custom_price: typeof billing.custom_price === 'number' ? billing.custom_price : null,
          billing_discount_percent: typeof billing.discount_percent === 'number' ? billing.discount_percent : null,
          billing_discount_fixed: typeof billing.discount_fixed === 'number' ? billing.discount_fixed : null,
          asaas_customer_id: billing.asaas_customer_id || null,
          last_charge: billing.last_charge || null,
        };
      }),
    };
  }

  async updateDealerPlan(
    user: User,
    slug: string,
    data: {
      price?: number;
      duration_days?: number;
      billing_enabled?: boolean;
      billing_frequency?: string;
      max_vehicles?: number;
      xml_enabled?: boolean;
      sdr_enabled?: boolean;
      sdr_whatsapp?: string;
    },
  ) {
    this.checkAdmin(user);
    await this.ensureDealerPlans();

    const current = await this.prisma.adPlan.findUnique({ where: { slug } });
    if (!current || current.plan_type !== 'dealer') {
      throw new ForbiddenException('Plano de lojista não encontrado');
    }

    const features = ((current.features || {}) as any);
    return this.prisma.adPlan.update({
      where: { slug },
      data: {
        price: data.price ?? Number(current.price),
        duration_days: data.duration_days ?? current.duration_days,
        max_vehicles: data.max_vehicles ?? current.max_vehicles,
        features: {
          ...features,
          billing_enabled: data.billing_enabled ?? features.billing_enabled ?? true,
          billing_frequency: data.billing_frequency ?? features.billing_frequency ?? 'monthly',
          xml_enabled: data.xml_enabled ?? features.xml_enabled ?? false,
          sdr_enabled: data.sdr_enabled ?? features.sdr_enabled ?? false,
          sdr_whatsapp: data.sdr_whatsapp ?? features.sdr_whatsapp ?? '',
        } as any,
      },
    });
  }

  async assignDealerPlan(user: User, dealerId: string, planSlug: string) {
    this.checkAdmin(user);
    await this.ensureDealerPlans();

    const dealer = await this.prisma.dealer.findUnique({ where: { id: dealerId } });
    if (!dealer) throw new ForbiddenException('Lojista não encontrado');

    const plan = await this.prisma.adPlan.findUnique({ where: { slug: planSlug } });
    if (!plan || plan.plan_type !== 'dealer') {
      throw new ForbiddenException('Plano inválido');
    }

    const metadata = (dealer.working_hours || {}) as any;
    return this.prisma.dealer.update({
      where: { id: dealerId },
      data: {
        working_hours: {
          ...metadata,
          dealer_plan_slug: planSlug,
        } as any,
      },
      select: { id: true, name: true, slug: true },
    });
  }

  async updateBillingConfig(
    user: User,
    data: {
      asaas_enabled?: boolean;
      asaas_api_url?: string;
      asaas_api_key?: string;
      default_billing_type?: string;
      default_frequency?: string;
    },
  ) {
    this.checkAdmin(user);
    await this.ensureBillingConfig();
    const current = await this.prisma.adPlan.findUnique({ where: { slug: this.billingConfigSlug } });
    const features = ((current?.features || {}) as any);
    return this.prisma.adPlan.update({
      where: { slug: this.billingConfigSlug },
      data: {
        features: {
          ...features,
          asaas_enabled: data.asaas_enabled ?? features.asaas_enabled ?? false,
          asaas_api_url: data.asaas_api_url ?? features.asaas_api_url ?? 'https://api-sandbox.asaas.com',
          asaas_api_key: data.asaas_api_key ?? features.asaas_api_key ?? '',
          default_billing_type: data.default_billing_type ?? features.default_billing_type ?? 'CREDIT_CARD',
          default_frequency: data.default_frequency ?? features.default_frequency ?? 'monthly',
        } as any,
      },
    });
  }

  async updateDealerBilling(
    user: User,
    dealerId: string,
    data: {
      custom_price?: number | null;
      discount_percent?: number | null;
      discount_fixed?: number | null;
    },
  ) {
    this.checkAdmin(user);
    const dealer = await this.prisma.dealer.findUnique({ where: { id: dealerId } });
    if (!dealer) throw new ForbiddenException('Lojista não encontrado');
    const metadata = (dealer.working_hours || {}) as any;
    const currentBilling = ((metadata.billing || {}) as any);

    const normalize = (value: any) =>
      value === null || value === undefined || value === '' ? null : Number(value);

    return this.prisma.dealer.update({
      where: { id: dealerId },
      data: {
        working_hours: {
          ...metadata,
          billing: {
            ...currentBilling,
            custom_price: normalize(data.custom_price),
            discount_percent: normalize(data.discount_percent),
            discount_fixed: normalize(data.discount_fixed),
          },
        } as any,
      },
      select: { id: true, name: true, slug: true },
    });
  }

  async chargeDealerPlan(user: User, dealerId: string) {
    this.checkAdmin(user);
    await this.ensureBillingConfig();
    await this.ensureDealerPlans();

    const [dealer, billingConfigPlan] = await Promise.all([
      this.prisma.dealer.findUnique({
        where: { id: dealerId },
        include: { user: true },
      }),
      this.prisma.adPlan.findUnique({ where: { slug: this.billingConfigSlug } }),
    ]);

    if (!dealer || !dealer.user) throw new ForbiddenException('Lojista não encontrado');
    const metadata = (dealer.working_hours || {}) as any;
    const billingCfg = ((billingConfigPlan?.features || {}) as any);
    if (!billingCfg.asaas_enabled) {
      throw new ForbiddenException('Asaas está desabilitado no painel');
    }

    const planSlug = metadata.dealer_plan_slug || 'dealer-plan-1';
    const plan = await this.prisma.adPlan.findUnique({ where: { slug: planSlug } });
    if (!plan || plan.plan_type !== 'dealer') {
      throw new ForbiddenException('Plano do lojista não encontrado');
    }

    const billing = ((metadata.billing || {}) as any);
    const basePrice = Number(plan.price || 0);
    const customPrice = typeof billing.custom_price === 'number' ? billing.custom_price : null;
    const discountPercent = typeof billing.discount_percent === 'number' ? billing.discount_percent : 0;
    const discountFixed = typeof billing.discount_fixed === 'number' ? billing.discount_fixed : 0;
    let finalPrice = customPrice ?? basePrice;
    if (customPrice === null) {
      finalPrice = finalPrice - (finalPrice * discountPercent) / 100 - discountFixed;
    }
    finalPrice = Number(Math.max(0, finalPrice).toFixed(2));

    if (finalPrice <= 0) {
      throw new ForbiddenException('Valor final inválido para cobrança');
    }

    let asaasCustomerId = billing.asaas_customer_id || '';
    if (!asaasCustomerId) {
      const createdCustomer = await this.requestAsaas<any>(billingCfg, '/v3/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: dealer.name || dealer.user.full_name || dealer.user.email,
          email: dealer.user.email,
          mobilePhone: this.sanitizePhone(dealer.user.whatsapp || dealer.user.phone),
        }),
      });
      asaasCustomerId = createdCustomer.id;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateFormatted = dueDate.toISOString().slice(0, 10);

    const payment = await this.requestAsaas<any>(billingCfg, '/v3/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'CREDIT_CARD',
        value: finalPrice,
        dueDate: dueDateFormatted,
        description: `Plano ${plan.name} - ${dealer.name}`,
      }),
    });

    await this.prisma.dealer.update({
      where: { id: dealer.id },
      data: {
        working_hours: {
          ...metadata,
          billing: {
            ...billing,
            asaas_customer_id: asaasCustomerId,
            last_charge: {
              id: payment.id,
              status: payment.status,
              value: payment.value,
              invoice_url: payment.invoiceUrl || null,
              created_at: new Date().toISOString(),
            },
          },
        } as any,
      },
    });

    return {
      dealer_id: dealer.id,
      plan_slug: planSlug,
      amount: finalPrice,
      asaas_payment_id: payment.id,
      status: payment.status,
      invoice_url: payment.invoiceUrl || null,
    };
  }

  private async ensureSiteSettingsRow() {
    const found = await this.prisma.siteSettings.findFirst();
    if (found) return found;
    return this.prisma.siteSettings.create({ data: {} });
  }

  async getPublicSiteSettings() {
    const row = await this.ensureSiteSettingsRow();
    return {
      gtm_id: row.gtm_id,
      ga_id: row.ga_id,
      meta_pixel_id: row.meta_pixel_id,
      google_oauth_client_id: row.google_oauth_client_id,
    };
  }

  async getAdminSiteSettings(user: User) {
    this.checkAdmin(user);
    const row = await this.ensureSiteSettingsRow();
    return {
      id: row.id,
      gtm_id: row.gtm_id,
      ga_id: row.ga_id,
      meta_pixel_id: row.meta_pixel_id,
      google_oauth_client_id: row.google_oauth_client_id,
      google_oauth_client_secret_set: Boolean(row.google_oauth_client_secret?.trim()),
      updated_at: row.updated_at,
    };
  }

  async updateAdminSiteSettings(user: User, body: UpdateSiteSettingsDto) {
    this.checkAdmin(user);
    const row = await this.ensureSiteSettingsRow();
    const data: Record<string, string | null> = {};
    if (body.gtm_id !== undefined) {
      data.gtm_id = body.gtm_id?.trim() ? body.gtm_id.trim() : null;
    }
    if (body.ga_id !== undefined) {
      data.ga_id = body.ga_id?.trim() ? body.ga_id.trim() : null;
    }
    if (body.meta_pixel_id !== undefined) {
      data.meta_pixel_id = body.meta_pixel_id?.trim() ? body.meta_pixel_id.trim() : null;
    }
    if (body.google_oauth_client_id !== undefined) {
      data.google_oauth_client_id = body.google_oauth_client_id?.trim()
        ? body.google_oauth_client_id.trim()
        : null;
    }
    if (body.google_oauth_client_secret !== undefined) {
      const s = body.google_oauth_client_secret?.trim();
      data.google_oauth_client_secret = s ? s : null;
    }
    const updated = await this.prisma.siteSettings.update({
      where: { id: row.id },
      data,
    });
    return {
      id: updated.id,
      gtm_id: updated.gtm_id,
      ga_id: updated.ga_id,
      meta_pixel_id: updated.meta_pixel_id,
      google_oauth_client_id: updated.google_oauth_client_id,
      google_oauth_client_secret_set: Boolean(updated.google_oauth_client_secret?.trim()),
      updated_at: updated.updated_at,
    };
  }
}
