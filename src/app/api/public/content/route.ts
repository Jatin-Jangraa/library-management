import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api-utils";
import LibrarySettings from "@/models/LibrarySettings";
import Facility from "@/models/Facility";
import Testimonial from "@/models/Testimonial";
import FAQ from "@/models/FAQ";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectDB();

    const settings = await LibrarySettings.findOne().lean();
    const facilities = await Facility.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    const testimonials = await Testimonial.find({ isActive: true }).lean();
    const faqs = await FAQ.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    const upcomingEvents = await Event.find({
      isActive: true,
      eventDate: { $gte: new Date() },
    }).sort({ eventDate: 1 }).limit(10).lean();

    return success({
      settings,
      facilities,
      testimonials,
      faqs,
      upcomingEvents,
    });
  } catch (err: any) {
    return error(err.message || "Failed to fetch content");
  }
}
