import Collection from '../../models/Collection.js';
import Product from '../../models/Product.js';

export class CollectionService {
  static async list(storeSlug: string, queryParams: any) {
    const { page = 1, limit = 25, search, handle, sort = '-createdAt' } = queryParams;
    
    const maxLimit = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * maxLimit;
    
    const filter: any = { storeSlug };
    
    if (handle) filter.handle = handle;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { handle: { $regex: escapedSearch, $options: 'i' } }
      ];
    }
    
    const sortConfig: any = {};
    if (sort.startsWith('-')) {
      sortConfig[sort.substring(1)] = -1;
    } else {
      sortConfig[sort] = 1;
    }

    const [collections, total] = await Promise.all([
      Collection.find(filter).sort(sortConfig).skip(skip).limit(maxLimit).lean(),
      Collection.countDocuments(filter)
    ]);
    
    return {
      collections,
      pagination: {
        page: Number(page),
        limit: maxLimit,
        total,
        totalPages: Math.ceil(total / maxLimit)
      }
    };
  }

  static async getById(storeSlug: string, id: string) {
    return Collection.findOne({ _id: id, storeSlug }).lean();
  }

  static async create(storeSlug: string, data: any) {
    let handle = data.handle;
    if (!handle) {
      handle = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let count = 1;
      let uniqueHandle = handle;
      while (await Collection.exists({ storeSlug, handle: uniqueHandle })) {
        uniqueHandle = `${handle}-${count}`;
        count++;
      }
      handle = uniqueHandle;
    }

    // Tenant isolation validation on selected products
    if (data.selectedProducts && data.selectedProducts.length > 0) {
      const products = await Product.find({ _id: { $in: data.selectedProducts } }).select('storeSlug').lean();
      if (products.length !== data.selectedProducts.length || products.some(p => p.storeSlug !== storeSlug)) {
        throw new Error('One or more selected products do not exist or belong to another store.');
      }
    }

    const collection = new Collection({
      ...data,
      storeSlug,
      handle
    });
    
    await collection.save();
    return collection;
  }

  static async update(storeSlug: string, id: string, data: any) {
    if (data.selectedProducts && data.selectedProducts.length > 0) {
      const products = await Product.find({ _id: { $in: data.selectedProducts } }).select('storeSlug').lean();
      if (products.length !== data.selectedProducts.length || products.some(p => p.storeSlug !== storeSlug)) {
        throw new Error('One or more selected products do not exist or belong to another store.');
      }
    }

    const collection = await Collection.findOneAndUpdate(
      { _id: id, storeSlug },
      { $set: data },
      { new: true, runValidators: true }
    );
    return collection;
  }

  static async delete(storeSlug: string, id: string) {
    return Collection.findOneAndDelete({ _id: id, storeSlug });
  }
}
