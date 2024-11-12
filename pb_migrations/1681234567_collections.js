/// <reference path="../pb_types.d.ts" />
migrate((db) => {
  // Create products collection
  const products = new Collection({
    name: 'products',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'price', type: 'number', required: true },
      { name: 'image', type: 'file', required: true },
      { name: 'category', type: 'text', required: true },
      { name: 'stock', type: 'number', required: true },
    ],
  });

  // Create orders collection
  const orders = new Collection({
    name: 'orders',
    type: 'base',
    schema: [
      { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_' } },
      { name: 'products', type: 'relation', required: true, options: { collectionId: products.id } },
      { name: 'total', type: 'number', required: true },
      { name: 'status', type: 'select', required: true, options: { values: ['pending', 'paid', 'failed'] } },
      { name: 'mpesaReference', type: 'text' },
    ],
  });

  return { products, orders };
});