export class AttributeSerializer {
  static serialize(attribute: any) {
    if (!attribute) return null;
    return {
      id: attribute._id.toString(),
      name: attribute.name,
      attributeset: attribute.attributeset,
      values: attribute.values,
      createdAt: attribute.createdAt,
      updatedAt: attribute.updatedAt
    };
  }

  static serializeList(attributes: any[]) {
    return attributes.map(this.serialize);
  }
}
