import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shopiators Public API',
      version: '1.0.0',
      description: 'Public API for integrating with Shopiators stores',
    },
    servers: process.env.NODE_ENV === 'production'
      ? [
        {
          url: 'https://api.shopiators.com/api/v1',
          description: 'Production server',
        }
      ]
      : [
        {
          url: 'http://localhost:3000/api/v1',
          description: 'Development server',
        },
        {
          url: 'https://api.shopiators.com/api/v1',
          description: 'Production server',
        }
      ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Collections', description: 'Collection management' },
      { name: 'Attribute Sets', description: 'Attribute Set management' },
      { name: 'Attributes', description: 'Attribute management' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API_KEY',
          description: 'Enter your API key here (e.g. sk_live_...)'
        }
      },
      schemas: {
        // ─────────────────── Attribute Set ───────────────────
        AttributeSet: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1e2b3c9e77b001f8e4abc' },
            name: { type: 'string', example: 'Clothing Attributes' },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ─────────────────── Attribute Value ───────────────────
        AttributeValue: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1e2b3c9e77b001f8e4def' },
            attribute: { type: 'string', description: 'ObjectId reference to parent Attribute', example: '64f1e2b3c9e77b001f8e4aaa' },
            name: { type: 'string', example: 'Red' },
            value: { type: 'string', example: 'Red' },
            hex: { type: 'string', description: 'Optional hex code for color swatches', example: '#FF0000' },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ─────────────────── Attribute ───────────────────
        Attribute: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1e2b3c9e77b001f8e4aaa' },
            name: { type: 'string', example: 'Color' },
            attributeset: { type: 'string', description: 'ObjectId reference to an AttributeSet', example: '64f1e2b3c9e77b001f8e4abc' },
            values: {
              type: 'array',
              description: 'Array of AttributeValue ObjectIds',
              items: { type: 'string' },
              example: ['64f1e2b3c9e77b001f8e4def'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ─────────────────── Variant ───────────────────
        Variant: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1e2b3c9e77b001f8e4bbb' },
            productId: { type: 'string', description: 'ObjectId reference to parent Product', example: '64f1e2b3c9e77b001f8e4ccc' },
            attributes: {
              type: 'object',
              description: 'Key-value map of attribute name to value (e.g. { "Color": "Red", "Size": "M" })',
              additionalProperties: { type: 'string' },
              example: { Color: 'Red', Size: 'M' },
            },
            price: { type: 'number', example: 15.00 },
            salePrice: { type: 'number', example: 12.00 },
            stock: { type: 'number', example: 100 },
            sku: { type: 'string', example: 'TSHIRT-RED-M' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ─────────────────── Product ───────────────────
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1e2b3c9e77b001f8e4ccc' },
            title: { type: 'string', example: 'Premium Cotton T-Shirt' },
            handle: { type: 'string', description: 'URL-friendly slug (auto-generated if not provided)', example: 'premium-cotton-t-shirt' },
            description: { type: 'string', example: 'A comfortable 100% cotton t-shirt.' },
            status: { type: 'string', enum: ['active', 'disabled'], example: 'active' },
            badge: { type: 'string', example: 'New' },
            price: { type: 'number', example: 15.00 },
            salePrice: { type: 'number', description: 'Strike-through/original price (mapped from comparePrice on input)', example: 20.00 },
            comparePrice: { type: 'number', description: 'Compare at price (must be >= price)', example: 20.00 },
            totalStock: { type: 'number', example: 200 },
            image: { type: 'array', items: { type: 'string' }, example: ['https://images.example.com/shirt.jpg'] },
            sizeChart: { type: 'string', description: 'URL or base64 data URI of size chart', example: 'https://images.example.com/sizechart.jpg' },
            selectedCollection: {
              type: 'array',
              description: 'Array of Collection ObjectIds this product belongs to',
              items: { type: 'string' },
              example: ['64f1e2b3c9e77b001f8e4ddd'],
            },
            attributeSet: { type: 'string', description: 'ObjectId reference to an AttributeSet', example: '64f1e2b3c9e77b001f8e4abc' },
            options: {
              type: 'array',
              description: 'Product variant options (e.g. Size, Color)',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Size' },
                  values: { type: 'array', items: { type: 'string' }, example: ['Small', 'Medium', 'Large'] },
                },
              },
            },
            variants: {
              type: 'array',
              description: 'Array of populated Variant objects',
              items: { $ref: '#/components/schemas/Variant' },
            },
            metaTitle: { type: 'string', example: 'Buy Premium Cotton T-Shirt Online' },
            metaDescription: { type: 'string', example: '100% Cotton T-Shirt in multiple sizes.' },
            metaKeywords: { type: 'string', example: 't-shirt, cotton, clothing' },
            returnConfig: {
              type: 'object',
              properties: {
                useGlobalConfig: { type: 'boolean', example: true },
                returnable: { type: 'boolean' },
                exchangeable: { type: 'boolean' },
                customReturnWindow: { type: 'number', description: 'Days; overrides store setting when useGlobalConfig is false' },
              },
            },
            averageRating: { type: 'number', example: 4.5 },
            totalReviews: { type: 'number', example: 120 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ─────────────────── Collection ───────────────────
        Collection: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1e2b3c9e77b001f8e4ddd' },
            title: { type: 'string', example: 'Summer Sale' },
            handle: { type: 'string', description: 'URL-friendly slug', example: 'summer-sale' },
            description: { type: 'string', example: 'Best deals of the summer season.' },
            image: { type: 'string', example: 'https://images.example.com/summer-sale.jpg' },
            collectionType: { type: 'string', enum: ['manual', 'smart'], example: 'manual' },
            selectedProducts: {
              type: 'array',
              description: 'Array of Product ObjectIds (for manual collections)',
              items: { type: 'string' },
              example: ['64f1e2b3c9e77b001f8e4ccc'],
            },
            parentCollection: { type: 'string', description: 'ObjectId of parent collection', example: '64f1e2b3c9e77b001f8e4eee' },
            childCollection: {
              type: 'array',
              description: 'Array of child Collection ObjectIds',
              items: { type: 'string' },
            },
            matchType: { type: 'string', enum: ['all condition', 'any condition'], description: 'Used for smart collections', example: 'all condition' },
            conditions: {
              type: 'array',
              description: 'Smart collection filter rules',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'title' },
                  operator: { type: 'string', example: 'contains' },
                  value: { type: 'string', example: 'shirt' },
                },
              },
            },
            metaTitle: { type: 'string', example: 'Summer Sale Collection' },
            metaDescription: { type: 'string', example: 'Shop our best summer deals.' },
            metaKeywords: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ─────────────────── Pagination ───────────────────
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 25 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 4 },
          },
        },

        // ─────────────────── Error ───────────────────
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'price should be less than compare at price' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/v1/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);

