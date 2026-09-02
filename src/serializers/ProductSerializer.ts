export class ProductSerializer {
  static serialize(product: any) {
    if (!product) return null;
    
    return {
      id: product._id ? product._id.toString() : product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      image: product.image || [],
      status: product.status,
      badge: product.badge,
      price: product.price,
      salePrice: product.salePrice,
      totalStock: product.totalStock,
      metaKeywords: product.metaKeywords,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      sizeChart: product.sizeChart,
      options: product.options || [],
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      attributeSet: product.attributeSet,
      attributeRows: product.attributeRows,
      attributeCombinations: product.attributeCombinations,
      variants: product.variants,
      selectedCollection: product.selectedCollection,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  static serializeMany(products: any[]) {
    return products.map(p => this.serialize(p));
  }
}
