import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  date: Date;
  category: string;
  amount: number;
  paymentMethod: string;
  description: string;
  vendor?: string;
  receiptImage?: string;
  notes?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    date: { type: Date, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true },
    description: { type: String, required: true },
    vendor: String,
    receiptImage: String,
    notes: String,
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ date: 1 });
ExpenseSchema.index({ category: 1 });

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
