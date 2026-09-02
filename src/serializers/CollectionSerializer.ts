export class CollectionSerializer {
  static serialize(collection: any) {
    if (!collection) return null;
    return {
      id: collection._id.toString(),
      title: collection.title,
      handle: collection.handle,
      description: collection.description,
      image: collection.image,
      collectionType: collection.collectionType,
      selectedProducts: collection.selectedProducts,
      metaTitle: collection.metaTitle,
      metaDescription: collection.metaDescription,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    };
  }

  static serializeList(collections: any[]) {
    return collections.map(this.serialize);
  }
}
