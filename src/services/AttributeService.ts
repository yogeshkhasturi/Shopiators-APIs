import Attribute from '../../models/Attribute.js';

export class AttributeService {
  static async list(storeSlug: string, queryParams: any) {
    const { page = 1, limit = 25, search, sort = '-createdAt' } = queryParams;
    
    const maxLimit = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * maxLimit;
    
    const filter: any = { storeSlug };
    
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }
    
    const sortConfig: any = {};
    if (sort.startsWith('-')) {
      sortConfig[sort.substring(1)] = -1;
    } else {
      sortConfig[sort] = 1;
    }

    const [attributes, total] = await Promise.all([
      Attribute.find(filter).sort(sortConfig).skip(skip).limit(maxLimit).lean(),
      Attribute.countDocuments(filter)
    ]);
    
    return {
      attributes,
      pagination: {
        page: Number(page),
        limit: maxLimit,
        total,
        totalPages: Math.ceil(total / maxLimit)
      }
    };
  }

  static async getById(storeSlug: string, id: string) {
    return Attribute.findOne({ _id: id, storeSlug }).lean();
  }

  static async create(storeSlug: string, data: any) {
    // In a full implementation, we'd validate attributeset and values belong to storeSlug
    const attribute = new Attribute({
      ...data,
      storeSlug
    });
    
    await attribute.save();
    return attribute;
  }

  static async update(storeSlug: string, id: string, data: any) {
    const attribute = await Attribute.findOneAndUpdate(
      { _id: id, storeSlug },
      { $set: data },
      { new: true, runValidators: true }
    );
    return attribute;
  }

  static async delete(storeSlug: string, id: string) {
    return Attribute.findOneAndDelete({ _id: id, storeSlug });
  }
}
