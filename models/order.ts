import mongoose, { Schema, model, models } from "mongoose";

// IOrder interface with proper typing for the model
export interface IOrder {
  _id?: mongoose.Types.ObjectId;
  title: string;
  price: number;
  image: string;
  category: string;
  status: "pending" | "completed" | "failed"; // Use TypeScript enums for better safety
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Order Schema with more validation and default timestamp
const orderSchema = new Schema<IOrder>(
  {
    title: { type: String, required: true },
    price: { 
      type: Number, 
      required: true, 
      min: [0, 'Price must be greater than or equal to zero'] // Added validation for price
    },
    image: { type: String, required: true },
    category: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed"], 
      default: "pending"
    },
    razorpayOrderId: { type: String, required: true, unique: true }, // Razorpay Order ID as required and unique
    razorpayPaymentId: { type: String },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// You can remove indexing here for now

export const Order = models.Order || model<IOrder>("Order", orderSchema);
