import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { Order } from "@/models/order";
import { connectToDatabase } from "@/lib/db";

// Initialize Razorpay with the API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});



export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { title, price, image, category } = await req.json();

    // Validate the incoming data
    if (!title || !price || !image || !category) {
      return NextResponse.json(
        { error: "Missing required fields (title, price, image, category)" },
        { status: 400 }
      );
    }

    // Validate price: it should be a positive number
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    // Validate image URL format
    const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/;
    if (!urlRegex.test(image)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    // Create the Razorpay order (amount in paise)
    const rzOrder = await razorpay.orders.create({
      amount: Math.round(price * 100), // Convert price to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        title,
        price,
        image,
        category,
      },
    });

    // Ensure DB connection is established before saving the order
    await connectToDatabase();

    // Save the order to the database
    const newOrder = new Order({
      title,
      price,
      image,
      category,
      status: "pending", // Default status
      razorpayOrderId: rzOrder.id,
    });

    await newOrder.save();

    // Return Razorpay order details along with custom order ID
    return NextResponse.json({ order: rzOrder, orderId: newOrder._id, razorpayOrderId: rzOrder.id });

  } catch (error) {
    // Improved error handling
    console.error("Error creating order:", error);

    // Return the specific error message if available
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
