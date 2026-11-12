export interface StorePublicMetadata {
  storeSlug: string;
  storeName: string;
  businessName: string;
  businessType: string | null;
  industry: string;
  description: string;
  domain: string | null;
  storeUrl: string | null;
  currency: {
    code: string;
    symbol: string | null;
  } | null;
  plan: {
    slug: string | null;
    name: string | null;
  } | null;
  productCount: number;
  status: string;
  logo: string | null;
  brandColors: {
    primary?: string;
    secondary?: string;
  } | null;
}

export class StoreSerializer {
  static serialize(
    store: any,
    options: { currency?: { code: string; symbol?: string | null } | null; productCount: number }
  ): StorePublicMetadata {
    const planObj = store.billingSnapshot?.plan;
    const planSlug = planObj?.slug || store.billingSnapshot?.planSlug || null;
    const planName = planObj?.name || null;

    return {
      storeSlug: store.storeSlug,
      storeName: store.storeName,
      businessName: store.businessName,
      businessType: store.businessType ?? null,
      industry: store.industry,
      description: store.description,
      domain: store.storeUrl ?? null,
      storeUrl: store.storeUrl ?? null,
      currency: options.currency
        ? {
            code: options.currency.code,
            symbol: options.currency.symbol ?? null,
          }
        : null,
      plan: planSlug || planName ? { slug: planSlug, name: planName } : null,
      productCount: options.productCount,
      status: store.status,
      logo: store.logo ?? null,
      brandColors: store.brandColors ?? null,
    };
  }
}

