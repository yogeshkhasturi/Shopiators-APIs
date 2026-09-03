export class AttributeSetSerializer {
  static serialize(attributeSet: any) {
    if (!attributeSet) return null;
    
    const { _id, __v, storeSlug, ...rest } = attributeSet;
    return {
      id: _id,
      ...rest
    };
  }

  static serializeMany(attributeSets: any[]) {
    return attributeSets.map(this.serialize);
  }
}
