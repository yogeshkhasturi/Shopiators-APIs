import Product from '../../models/Product.js';
import Variant from '../../models/Variant.js';
import Collection from '../../models/Collection.js';
import Attribute from '../../models/Attribute.js';
import AttributeValue from '../../models/AttributeValue.js';
import AttributeSet from '../../models/AttributeSet.js';
import AttributeCom from '../../models/AttributeCom.js';
import { ftpUploader } from './ftpUploader';

export class ProductService {
  static async list(storeSlug: string, queryParams: any) {
    const { page = 1, limit = 25, search, status, handle, sort = '-createdAt' } = queryParams;
    
    const maxLimit = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * maxLimit;
    
    const filter: any = { storeSlug };
    
    if (status) filter.status = status;
    if (handle) filter.handle = handle;
    if (search) {
      // Escape regex input to prevent ReDoS or operators
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { handle: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } }
      ];
    }
    
    const sortConfig: any = {};
    if (sort.startsWith('-')) {
      sortConfig[sort.substring(1)] = -1;
    } else {
      sortConfig[sort] = 1;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortConfig)
        .skip(skip)
        .limit(maxLimit)
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    return {
      products,
      pagination: {
        page: Number(page),
        limit: maxLimit,
        total,
        totalPages: Math.ceil(total / maxLimit)
      }
    };
  }

  static async getById(storeSlug: string, id: string) {
    return Product.findOne({ _id: id, storeSlug }).lean();
  }

  static async create(storeSlug: string, data: any) {
    // 1. Generate handle if not provided
    let handle = data.handle;
    if (!handle) {
      handle = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let count = 1;
      let uniqueHandle = handle;
      while (await Product.exists({ storeSlug, handle: uniqueHandle })) {
        uniqueHandle = `${handle}-${count}`;
        count++;
      }
      handle = uniqueHandle;
    }

    // 2. Map payload variations to MongoDB schema expectations
    if (data.selectedCollections && !data.selectedCollection) {
      data.selectedCollection = data.selectedCollections;
    }
    if (data.comparePrice !== undefined) {
      data.salePrice = data.comparePrice;
    }

    // 3. FTP Image Upload Processing
    let uploadedImages: string[] = [];
    if (data.images && data.images.length > 0) {
      for (const img of data.images) {
        try {
          const result = await ftpUploader.v2.uploader.upload(img, { folder: storeSlug });
          uploadedImages.push(result.secure_url);
        } catch (e) {
          console.error('Error uploading image to FTP:', e);
        }
      }
    }
    
    let uploadedSizeChart = data.sizeChart;
    if (data.sizeChart && data.sizeChart.startsWith('data:')) {
       try {
          const result = await ftpUploader.v2.uploader.upload(data.sizeChart, { folder: `${storeSlug}/sizecharts` });
          uploadedSizeChart = result.secure_url;
       } catch (e) {
          console.error('Error uploading size chart to FTP:', e);
       }
    }

    // 4. Tenant isolation validation on selected collection
    if (data.selectedCollection && data.selectedCollection.length > 0) {
      const collections = await Collection.find({ _id: { $in: data.selectedCollection } }).select('storeSlug').lean();
      if (collections.length !== data.selectedCollection.length || collections.some(c => c.storeSlug !== storeSlug)) {
        throw new Error('One or more selected collections do not exist or belong to another store.');
      }
    }

    const { options, ...productData } = data;
    const attributeRows: any[] = [];
    let variantsToCreate: any[] = [];
    let attributeComsToCreate: any[] = [];
    let attributeSetId = null;

    // 5. Process dynamic attributes and variants
    if (options && options.length > 0) {
      // Create AttributeSet
      const attributeSet = await AttributeSet.create({
        name: `${productData.title} - Attributes`,
        storeSlug,
        status: 'active'
      });
      attributeSetId = attributeSet._id;

      // Used to map string names back to ObjectIds and Names for AttributeCom
      const optionResolvers: any[] = [];

      for (const option of options) {
        // Upsert Attribute
        let attribute = await Attribute.findOne({ storeSlug, name: option.name });
        if (!attribute) {
          attribute = await Attribute.create({ storeSlug, name: option.name, values: [] });
        }

        const valueObjectIds = [];
        const resolvedValues: any[] = [];

        for (const valString of option.values) {
          // Upsert AttributeValue
          let attrVal = await AttributeValue.findOne({ storeSlug, attribute: attribute._id, name: valString });
          if (!attrVal) {
            attrVal = await AttributeValue.create({ storeSlug, attribute: attribute._id, name: valString, value: valString });
            
            // Link to parent attribute
            attribute.values.push(attrVal._id);
            await attribute.save();
          }
          valueObjectIds.push(attrVal._id);
          resolvedValues.push({ id: attrVal._id, name: attrVal.name });
        }

        attributeRows.push({
          attribute: attribute._id,
          attributeValue: valueObjectIds
        });

        optionResolvers.push({
          attributeId: attribute._id,
          attributeName: attribute.name,
          values: resolvedValues
        });
      }

      // Generate Cartesian Product of values for Variants
      const cartesianProduct = (arrays: any[][]) => {
        return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
      };

      // We need to cartesian product the indices so we can look up IDs and names
      const indexArrays = optionResolvers.map((opt: any) => opt.values.map((_: any, i: number) => i));
      const indexCombinations = cartesianProduct(indexArrays);
      const normalizedIndexCombinations = optionResolvers.length === 1 ? indexCombinations.map(c => [c]) : indexCombinations;

      for (const comboIndices of normalizedIndexCombinations) {
        const attributesMap: any = {};
        const attributeIdMap: any = {};
        const attributeDetails: any[] = [];
        let skuSuffixParts: string[] = [];

        comboIndices.forEach((valIndex: number, optIndex: number) => {
          const resolver = optionResolvers[optIndex];
          const valObj = resolver.values[valIndex];

          attributesMap[resolver.attributeName] = valObj.name;
          attributeIdMap[resolver.attributeId.toString()] = valObj.id.toString();
          skuSuffixParts.push(valObj.name);

          attributeDetails.push({
            attributeId: resolver.attributeId,
            attributeName: resolver.attributeName,
            attributeValueId: valObj.id,
            attributeValueName: valObj.name,
            colorCode: ""
          });
        });

        const sku = `${handle}-${skuSuffixParts.join('-').replace(/\s+/g, '')}`.toUpperCase();

        variantsToCreate.push({
          storeSlug,
          attributes: attributesMap,
          price: productData.price || 0,
          salePrice: productData.salePrice || 0,
          stock: productData.totalStock || 1,
          sku: sku
        });

        attributeComsToCreate.push({
          storeSlug,
          attributes: attributeIdMap,
          attributeDetails: attributeDetails,
          price: productData.price || 0,
          salePrice: productData.salePrice || 0,
          stock: productData.totalStock || 1,
          sku: sku,
          image: uploadedImages.length > 0 ? uploadedImages[0] : ""
        });
      }
    }

    // 6. Create Product
    const product = new Product({
      ...productData,
      storeSlug,
      handle,
      attributeSet: attributeSetId,
      attributeRows,
      options: options || [],
      image: uploadedImages.length > 0 ? uploadedImages : productData.image,
      sizeChart: uploadedSizeChart
    });
    
    await product.save();

    // 7. Create Variants and AttributeComs and link to Product
    if (variantsToCreate.length > 0) {
      variantsToCreate = variantsToCreate.map(v => ({ ...v, productId: product._id }));
      const createdVariants = await Variant.insertMany(variantsToCreate);
      
      attributeComsToCreate = attributeComsToCreate.map(ac => ({ ...ac, productId: product._id }));
      const createdComs = await AttributeCom.insertMany(attributeComsToCreate);
      
      product.variants = createdVariants.map(v => v._id);
      product.attributeCombinations = createdComs.map(c => c._id);
      await product.save();
    }

    return Product.findById(product._id).populate('variants').lean();
  }

  static async update(storeSlug: string, id: string, data: any) {
    if (data.selectedCollections && !data.selectedCollection) {
      data.selectedCollection = data.selectedCollections;
    }
    if (data.comparePrice !== undefined) {
      data.salePrice = data.comparePrice;
    }

    let uploadedImages: string[] = [];
    if (data.images && data.images.length > 0) {
      for (const img of data.images) {
        try {
          if (img.startsWith('http') && img.includes('images.webiators.com')) {
            uploadedImages.push(img);
          } else {
            const result = await ftpUploader.v2.uploader.upload(img, { folder: storeSlug });
            uploadedImages.push(result.secure_url);
          }
        } catch (e) {
          console.error('Error uploading image to FTP:', e);
        }
      }
    }

    let uploadedSizeChart = data.sizeChart;
    if (data.sizeChart && data.sizeChart.startsWith('data:')) {
       try {
          const result = await ftpUploader.v2.uploader.upload(data.sizeChart, { folder: `${storeSlug}/sizecharts` });
          uploadedSizeChart = result.secure_url;
       } catch (e) {
          console.error('Error uploading size chart to FTP:', e);
       }
    }

    const updateData: any = { ...data };
    delete updateData.images;
    delete updateData.comparePrice;
    delete updateData.selectedCollections;

    if (uploadedImages.length > 0) {
      updateData.image = uploadedImages;
    }
    if (uploadedSizeChart) {
      updateData.sizeChart = uploadedSizeChart;
    }

    // Remove empty/undefined fields explicitly to ignore them if they are blank in payload but not meant to overwrite
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    const product = await Product.findOneAndUpdate(
      { _id: id, storeSlug },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('variants').lean();
    
    return product;
  }

  static async delete(storeSlug: string, id: string) {
    const product = await Product.findOneAndDelete({ _id: id, storeSlug });
    if (product) {
      // Cascading delete variants
      await Variant.deleteMany({ productId: id, storeSlug });
      // Cascading delete attribute combinations
      await AttributeCom.deleteMany({ productId: id, storeSlug });
      
      // Cascading delete the dedicated attribute set
      if (product.attributeSet) {
        await AttributeSet.findByIdAndDelete(product.attributeSet);
      }
    }
    return product;
  }
}
