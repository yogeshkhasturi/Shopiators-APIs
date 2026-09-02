import Variant from '../../models/Variant.js';
import Product from '../../models/Product.js';

export class VariantService {
  static async list(storeSlug: string, productId: string) {
    return Variant.find({ storeSlug, productId }).lean();
  }

  static async getById(storeSlug: string, productId: string, id: string) {
    return Variant.findOne({ _id: id, storeSlug, productId }).lean();
  }

  static async create(storeSlug: string, productId: string, data: any) {
    // Verify product exists and belongs to tenant
    const product = await Product.findOne({ _id: productId, storeSlug });
    if (!product) {
      throw new Error('Product not found');
    }

    const variant = new Variant({
      ...data,
      storeSlug,
      productId
    });
    
    await variant.save();
    
    // Add to product variants array
    await Product.updateOne(
      { _id: productId },
      { $push: { variants: variant._id } }
    );
    
    return variant;
  }

  static async update(storeSlug: string, productId: string, id: string, data: any) {
    const variant = await Variant.findOneAndUpdate(
      { _id: id, storeSlug, productId },
      { $set: data },
      { new: true, runValidators: true }
    );
    return variant;
  }

  static async delete(storeSlug: string, productId: string, id: string) {
    const variant = await Variant.findOneAndDelete({ _id: id, storeSlug, productId });
    
    if (variant) {
      // Remove from product variants array
      await Product.updateOne(
        { _id: productId },
        { $pull: { variants: variant._id } }
      );
    }
    
    return variant;
  }
}
