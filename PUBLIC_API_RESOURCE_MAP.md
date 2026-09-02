# Public API Resource Map

This document outlines the resources exposed by the Shopiators Public API v1, mapping them to their underlying MongoDB collections and defining access boundaries.

## 1. Product
- **Model:** `Product` (`models/Product.js`)
- **MongoDB Collection:** `products`
- **Tenant Field:** `storeSlug`
- **Relationships:**
  - `selectedCollection` -> `Collection`
  - `attributeSet` -> `AttributeSet`
  - `attributeRows` -> `Attribute` and `AttributeValue`
  - `attributeCombinations` -> `AttributeCom`
  - `variants` -> `Variant`
- **Public Read Fields:** `id`, `title`, `handle`, `description`, `image`, `status`, `badge`, `price`, `salePrice`, `totalStock`, `metaKeywords`, `metaTitle`, `metaDescription`, `sizeChart`, `options`, `averageRating`, `totalReviews`, `createdAt`, `updatedAt`
- **Public Write Fields:** `title`, `handle`, `description`, `image`, `status`, `badge`, `price`, `salePrice`, `totalStock`, `metaKeywords`, `metaTitle`, `metaDescription`, `sizeChart`, `options`
- **Server-Generated Fields:** `storeSlug`, `id`, `createdAt`, `updatedAt`, `syncedToMeta`, `returnConfig`
- **Protected Fields:** `__v`, internal array ObjectIds (unless mapped safely)
- **Required Scope:** `products:read`, `products:write`
- **Supported Endpoints:**
  - `GET /api/v1/products`
  - `POST /api/v1/products`
  - `GET /api/v1/products/:id`
  - `PATCH /api/v1/products/:id`
  - `DELETE /api/v1/products/:id`

## 2. Variant
- **Model:** `Variant` (`models/Variant.js`)
- **MongoDB Collection:** `variants`
- **Tenant Field:** `storeSlug`
- **Relationships:**
  - `productId` -> `Product`
- **Public Read Fields:** `id`, `productId`, `attributes`, `price`, `salePrice`, `stock`, `sku`
- **Public Write Fields:** `attributes`, `price`, `salePrice`, `stock`, `sku`
- **Server-Generated Fields:** `storeSlug`, `id`, `productId`
- **Protected Fields:** `__v`
- **Required Scope:** `variants:read`, `variants:write`
- **Supported Endpoints:**
  - `GET /api/v1/products/:productId/variants`
  - `POST /api/v1/products/:productId/variants`
  - `GET /api/v1/products/:productId/variants/:id`
  - `PATCH /api/v1/products/:productId/variants/:id`
  - `DELETE /api/v1/products/:productId/variants/:id`

## 3. Collection
- **Model:** `Collection` (`models/Collection.js`)
- **MongoDB Collection:** `collections`
- **Tenant Field:** `storeSlug`
- **Relationships:**
  - `selectedProducts`, `selectedSmartProducts` -> `Product`
  - `parentCollection`, `childCollection` -> `Collection`
- **Public Read Fields:** `id`, `title`, `handle`, `description`, `image`, `collectionType`, `matchType`, `conditions`, `metaKeywords`, `metaTitle`, `metaDescription`, `createdAt`, `updatedAt`
- **Public Write Fields:** `title`, `handle`, `description`, `image`, `collectionType`, `matchType`, `conditions`, `metaKeywords`, `metaTitle`, `metaDescription`
- **Server-Generated Fields:** `storeSlug`, `id`, `createdAt`, `updatedAt`
- **Protected Fields:** `__v`
- **Required Scope:** `collections:read`, `collections:write`
- **Supported Endpoints:**
  - `GET /api/v1/collections`
  - `POST /api/v1/collections`
  - `GET /api/v1/collections/:id`
  - `PATCH /api/v1/collections/:id`
  - `DELETE /api/v1/collections/:id`

## 4. Attributes (Attribute, AttributeValue, AttributeSet)
- **Models:** `Attribute`, `AttributeValue`, `AttributeSet`
- **Tenant Field:** `storeSlug`
- **Relationships:** Nested hierarchy. `AttributeSet` -> `Attribute` -> `AttributeValue`
- **Required Scope:** `attributes:read`, `attributes:write`
- **Supported Endpoints:** CRUD operations for each resource.

## 5. Customer
- **Model:** `User` (`models/User.js`)
- **MongoDB Collection:** `users`
- **Tenant Field:** `storeSlug`
- **Role Verification:** Must explicitly verify `role === "user"` to prevent exposing merchant/admin accounts.
- **Public Read Fields:** `id`, `email`, `firstName`, `lastName`, `phoneNumber`, `userName`, `address`, `city`, `state`, `pincode`, `createdAt`, `updatedAt`
- **Public Write Fields:** `email`, `firstName`, `lastName`, `phoneNumber`, `userName`, `address`, `city`, `state`, `pincode`
- **Server-Generated Fields:** `storeSlug`, `id`, `role` (forced to 'user'), `createdAt`, `updatedAt`
- **Protected Fields:** `password`, `resetPasswordToken`, `resetPasswordExpire`, `resetAttempts`, `firstResetAttemptAt`, `__v`, admin metadata
- **Required Scope:** `customers:read`, `customers:write`
- **Supported Endpoints:**
  - `GET /api/v1/customers`
  - `POST /api/v1/customers`
  - `GET /api/v1/customers/:id`
  - `PATCH /api/v1/customers/:id`
  - `DELETE /api/v1/customers/:id`

## 6. Inventory
- **Relevant Fields:** `Product.totalStock`, `Variant.stock`
- **Tenant Field:** `storeSlug`
- **Required Scope:** `inventory:read`, `inventory:write`
- **Supported Endpoints:**
  - `GET /api/v1/inventory`
  - `GET /api/v1/products/:productId/inventory`
  - `PATCH /api/v1/products/:productId/inventory`

## 7. Store (Read-Only)
- **Model:** `Store` (`models/store.js`)
- **MongoDB Collection:** `stores`
- **Tenant Field:** `storeSlug` / `tenantId`
- **Public Read Fields:** `storeSlug`, `storeName`, `businessName`, `businessType`, `industry`, `description`, `targetAudience`, `uniqueValue`, `storeVibe`, `brandColors`, `logoStyle`, `images`, `logo`, `status`, `storeUrl`
- **Protected Fields:** `config`, `billingSnapshot`, `currentSubscriptionId`, `userId`, `tenantId`, internal statuses.
- **Required Scope:** `store:read`
- **Supported Endpoints:**
  - `GET /api/v1/store`

## 8. Orders (Deferred)
- **Status:** Not implemented.
- **Reason:** `Order` model exists but is not used in the Onboarding context. Orders are managed by a separate storefront service.
- **Endpoints:** Documented extension points, but no actual functional endpoints.

## 9. API Credentials
- **Model Needed:** A new model for API credentials to handle authentication independently from Admin/User.
- **Fields:** `apiKeyId`, `hashedSecret`, `storeSlug`, `scopes`, `environment` (`test`/`live`), `status`, `createdAt`, `lastUsedAt`.
- **Note:** Creation of these keys is handled by Admin/internal tools, not exposed publicly.
