/// <reference path="../pb_types.d.ts" />
migrate((db) => {
  // Create products collection
  const products = new Collection({
    name: 'products',
    type: 'base',
    system: false,
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'price', type: 'number', required: true, min: 0 },
      { name: 'image', type: 'file', required: true },
      { name: 'category', type: 'text', required: true },
      { name: 'stock', type: 'number', required: true, min: 0 },
    ],
    indexes: ['category'],
  });

  // Create orders collection
  const orders = new Collection({
    name: 'orders',
    type: 'base',
    system: false,
    schema: [
      { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_' } },
      { name: 'products', type: 'relation', required: true, options: { collectionId: products.id } },
      { name: 'total', type: 'number', required: true, min: 0 },
      { name: 'status', type: 'select', required: true, options: { values: ['pending', 'paid', 'failed'] } },
      { name: 'mpesaReference', type: 'text' },
      { name: 'phoneNumber', type: 'text', required: true },
    ],
    indexes: ['user', 'status'],
  });

  return { products, orders };
});