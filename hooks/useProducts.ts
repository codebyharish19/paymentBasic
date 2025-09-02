'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';

// Type for the product object
interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

// Type for the hook's return value
interface UseProductsResponse {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const useProducts = (): UseProductsResponse => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if products are already in localStorage
    const storedProducts = localStorage.getItem('products');
    
    if (storedProducts) {
      // If products are found in localStorage, use them
      setProducts(JSON.parse(storedProducts));
      setLoading(false);
    } else {
      // If no products in localStorage, fetch from the API
      axios.get('https://fakestoreapi.com/products')
        .then((response) => {
          const fetchedProducts = response.data;
          setProducts(fetchedProducts);
          localStorage.setItem('products', JSON.stringify(fetchedProducts)); // Save to localStorage
          setLoading(false);
        })
        .catch((err) => {
          setError('Error fetching products');
          setLoading(false);
        });
    }
  }, []); // Empty dependency array to run once when the component mounts

  return { products, loading, error };
};

export default useProducts;
