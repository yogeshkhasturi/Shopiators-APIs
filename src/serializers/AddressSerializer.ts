export class AddressSerializer {
  static serialize(address: any) {
    if (!address) return null;

    const obj = address.toObject ? address.toObject() : address;
    
    // Strip internal fields
    const { 
      _id, 
      __v, 
      storeSlug,
      ...rest 
    } = obj;

    return {
      id: _id ? _id.toString() : undefined,
      ...rest,
    };
  }

  static serializeMany(addresses: any[]) {
    return addresses.map((address) => this.serialize(address));
  }
}
