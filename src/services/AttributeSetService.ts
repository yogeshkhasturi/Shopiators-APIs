import AttributeSet from '../../models/AttributeSet.js';

export class AttributeSetService {
  static async list(storeSlug: string, queryParams: any) {
    const { page = 1, limit = 25, search, sort = '-createdAt', status } = queryParams;
    
    const maxLimit = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * maxLimit;
    
    const filter: any = { storeSlug };
    
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }
    
    const sortConfig: any = {};
    if (sort.startsWith('-')) {
      sortConfig[sort.substring(1)] = -1;
    } else {
      sortConfig[sort] = 1;
    }

    const [attributeSets, total] = await Promise.all([
      AttributeSet.find(filter).sort(sortConfig).skip(skip).limit(maxLimit).lean(),
      AttributeSet.countDocuments(filter)
    ]);
    
    return {
      attributeSets,
      pagination: {
        page: Number(page),
        limit: maxLimit,
        total,
        totalPages: Math.ceil(total / maxLimit)
      }
    };
  }

  static async getById(storeSlug: string, id: string) {
    return AttributeSet.findOne({ _id: id, storeSlug }).lean();
  }

  static async create(storeSlug: string, data: any) {
    const attributeSet = new AttributeSet({
      ...data,
      storeSlug
    });
    
    await attributeSet.save();
    return attributeSet;
  }

  static async update(storeSlug: string, id: string, data: any) {
    const attributeSet = await AttributeSet.findOneAndUpdate(
      { _id: id, storeSlug },
      { $set: data },
      { new: true, runValidators: true }
    );
    return attributeSet;
  }

  static async delete(storeSlug: string, id: string) {
    return AttributeSet.findOneAndDelete({ _id: id, storeSlug });
  }
}
