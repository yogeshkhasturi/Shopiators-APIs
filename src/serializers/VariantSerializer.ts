export class VariantSerializer {
  static serialize(variant: any) {
    if (!variant) return null;
    
    return {
      id: variant._id ? variant._id.toString() : variant.id,
      productId: variant.productId,
      attributes: variant.attributes || {},
      price: variant.price,
      salePrice: variant.salePrice,
      stock: variant.stock,
      sku: variant.sku
    };
  }

  static serializeMany(variants: any[]) {
    return variants.map(v => this.serialize(v));
  }
}
