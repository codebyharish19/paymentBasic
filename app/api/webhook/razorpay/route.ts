import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Order } from "@/models/order";
import { connectToDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Parse request body as text
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Ensure signature is present
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Compute the expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    // Compare the received signature with the expected one
    if (signature !== expectedSignature) {
      console.warn("Invalid signature", { signature, expectedSignature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse the event data
    const event = JSON.parse(body);

    // Connect to the database once
    await connectToDatabase();

    // Handle payment captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      // Update order with payment details
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          razorpayPaymentId: payment.id,
          status: "completed",
        },
        { new: true } // Return the updated document
      );

      // Log success
      if (order) {
        console.log(`Payment captured for order: ${payment.order_id}`);
      } else {
        console.error(`Order with Razorpay Order ID ${payment.order_id} not found.`);
      }
    }

    // Return success response
    return NextResponse.json({ received: true });

  } catch (error) {
    // Catch and log errors
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
