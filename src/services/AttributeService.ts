import Attribute from '../../models/Attribute.js';

import AttributeValue from '../../models/AttributeValue.js';

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
    const valuesInput = data.values || [];
    delete data.values; // We will set this after attribute creation

    const attribute = new Attribute({
      ...data,
      storeSlug
    });
    
    await attribute.save();

    const resolvedValues = [];
    if (valuesInput && Array.isArray(valuesInput)) {
      for (const val of valuesInput) {
        if (/^[0-9a-fA-F]{24}$/.test(val)) {
          // It's an ObjectId
          resolvedValues.push(val);
        } else {
          // It's a string name
          let attrVal = await AttributeValue.findOne({ storeSlug, attribute: attribute._id, name: val });
          if (!attrVal) {
            attrVal = await AttributeValue.create({ storeSlug, attribute: attribute._id, name: val, value: val });
          }
          resolvedValues.push(attrVal._id);
        }
      }
      attribute.values = resolvedValues;
      await attribute.save();
    }

    return attribute;
  }

  static async update(storeSlug: string, id: string, data: any) {
    if (data.values && Array.isArray(data.values)) {
      const resolvedValues = [];
      for (const val of data.values) {
        if (/^[0-9a-fA-F]{24}$/.test(val)) {
          resolvedValues.push(val);
        } else {
          let attrVal = await AttributeValue.findOne({ storeSlug, attribute: id, name: val });
          if (!attrVal) {
            attrVal = await AttributeValue.create({ storeSlug, attribute: id, name: val, value: val });
          }
          resolvedValues.push(attrVal._id);
        }
      }
      data.values = resolvedValues;
    }

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
