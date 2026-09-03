const Address = require('../../models/Address');

export class AddressService {
  static async listByCustomer(storeSlug: string, customerId: string) {
    const addresses = await Address.find({ storeSlug, userId: customerId }).lean();
    return addresses;
  }

  static async getById(storeSlug: string, id: string) {
    const address = await Address.findOne({ _id: id, storeSlug }).lean();
    if (!address) {
      const error: any = new Error('Address not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return address;
  }

  static async create(storeSlug: string, customerId: string, data: any) {
    // If this address is set as default, unset others for this customer
    if (data.isDefault) {
      await Address.updateMany(
        { storeSlug, userId: customerId },
        { $set: { isDefault: false } }
      );
    }

    const address = new Address({
      ...data,
      userId: customerId,
      storeSlug,
    });

    await address.save();
    return address.toObject();
  }

  static async update(storeSlug: string, id: string, data: any) {
    const address = await Address.findOne({ _id: id, storeSlug });
    if (!address) {
      const error: any = new Error('Address not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (data.isDefault) {
      await Address.updateMany(
        { storeSlug, userId: address.userId },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, data);
    await address.save();

    return address.toObject();
  }

  static async delete(storeSlug: string, id: string) {
    const address = await Address.findOneAndDelete({ _id: id, storeSlug });
    if (!address) {
      const error: any = new Error('Address not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return true;
  }
}
