'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // For App Router
import axios from 'axios';

// Define the type for the product
interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

const ProductDescriptionPage: React.FC = () => {
  // Access the dynamic `id` from the URL using useParams
  const { id } = useParams();  // Get `id` from dynamic route [id]
  
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;  // If `id` is not available, do nothing

    const storedProduct = localStorage.getItem('products');
    if (storedProduct) {
      const products = JSON.parse(storedProduct);  // Get all products from localStorage
      const foundProduct = products.find((product: Product) => product.id === parseInt(id as string)); // Filter by `id`

      if (foundProduct) {
        setProduct(foundProduct);  // Set product if found
      } else {
        setError('Product not found');  // Set error if not found
      }
    } else {
      setError('No product data available in localStorage');  // If no products are found in localStorage
    }
  }, [id]);  // Trigger when `id` changes

  // Handle loading or error state
  if (!product && !error) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  const handlePayment = async (product: Product) => {
    try {
      console.log('Making payment request for product:', product);

      // Call the backend API to create the Razorpay order using Axios
      const response = await axios.post('/api/order', {
        title: product.title,
        price: 1,
        image: product.image,
        category: product.category,
      });

      console.log('API response:', response.data);
      const { data } = response;
      if (data.error) {
        alert(data.error + " Please try again"); // Show error if there's any issue
        return;
      }

      const { order, orderId, razorpayOrderId } = data; // Get order details and order ID from backend

      // Log the orderId and razorpayOrderId for debugging
      console.log("Received Order ID:", orderId);
      console.log("Received Razorpay Order ID:", razorpayOrderId);

      // Check if Razorpay Order ID exists
      if (!razorpayOrderId) {
        alert("Razorpay Order ID is missing!");
        return;
      }

      // Prepare Razorpay options
      const options = {
        key: "rzp_test_RChCegSU4Z8ntX", // Use environment variable for Razorpay Key ID (Ensure it's public)
        amount: 100*100 , // Convert price to paise (1 INR = 100 paise)
        currency: "INR",
        name: product?.title,
        description: product?.category,
        image: product?.image,
        order_id: razorpayOrderId, // Dynamically set the Razorpay order ID
        prefill: {
          name: "Customer Name", // You can prefill customer details
          email: "customer@example.com",
          contact: "1234567890",
        },
        handler: function (response: any) {
          // Handle payment success
          console.log("Payment Successful: ", response);
          alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
        },
        notes: {
          address: "Corporate Office",
        },
        theme: {
          color: "#F37254", // Razorpay checkout theme color
        },
      };

      // Log the Razorpay options for debugging
      console.log("Razorpay options:", options);

      // Initialize Razorpay Checkout
      const razorpay = new (window as any).Razorpay(options);
      console.log('Opening Razorpay Checkout');
      razorpay.open();
    } catch (error) {
      console.error("Error during payment:", error);
      alert("Something went wrong while processing the payment.");
    }
  };

  return (
    <div className="bg-gray-800 text-white p-8 w-full min-h-screen flex flex-col items-center justify-center">
      {/* Container for the product details */}
      <div className="max-w-3xl w-full bg-gray-900 rounded-xl p-6 shadow-xl">
        
        {/* Product Title */}
        <h1 className="text-4xl font-extrabold text-center text-white mb-6">{product?.title}</h1>

        {/* Product Image */}
        <img
          src={product?.image}
          alt={product?.title}
          className="w-full h-72 object-contain mb-6 rounded-lg shadow-lg"
        />

        {/* Product Price */}
        <p className="text-2xl font-semibold text-green-500 text-center">{`₹${Math.round(product?.price || 0)}`}</p>

        {/* Product Category */}
        <p className="mt-4 text-lg text-center text-gray-400">{product?.category}</p>

        {/* "Pay Now" Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => handlePayment(product!)}  // Trigger payment flow
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDescriptionPage;
