import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api-utils";
import MembershipPlan from "@/models/MembershipPlan";
import Seat from "@/models/Seat";

export async function GET() {
  try {
    await connectDB();
    const plans = await MembershipPlan.find({ isActive: true }).sort({ monthlyFee: 1 }).lean();

    const plansWithSeats = await Promise.all(
      plans.map(async (plan: any) => {
        const seats = await Seat.countDocuments({ isActive: true, status: "available" });
        return { ...plan, availableSeats: seats };
      })
    );

    return success(plansWithSeats);
  } catch (err: any) {
    return error(err.message || "Failed to fetch plans");
  }
}
