'use client'

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import useProducts from '@/hooks/useProducts';

const ProductsPage = () => {
  const { products, loading, error } = useProducts();
  const router = useRouter(); // Initialize the router from next/navigation

  // Handle click on product to navigate to the product details page
  const handleProductClick = (id: number) => {
    router.push(`/products/${id}`); // Redirect to the dynamic product page
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="p-4 border rounded-lg shadow-lg hover:shadow-2xl cursor-pointer"
            onClick={() => handleProductClick(product.id)} // Add onClick to trigger navigation
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-64 object-cover rounded-md"
            />
            <h2 className="text-xl font-semibold mt-4">{product.title}</h2>
            <p className="text-sm text-gray-600">{product.category}</p>
            <p className="mt-2 text-lg font-bold text-blue-600">₹{Math.round(product.price)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
