import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/library_management";

function generatePassword(length: number = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;

  await db.dropDatabase();
  console.log("Database dropped");

  const Users = db.collection("users");
  const StudentProfiles = db.collection("studentprofiles");
  const LibrarySettings = db.collection("librarysettings");
  const Rooms = db.collection("rooms");
  const Seats = db.collection("seats");
  const MembershipPlans = db.collection("membershipplans");
  const Memberships = db.collection("memberships");
  const Payments = db.collection("payments");
  const Attendances = db.collection("attendances");
  const Notifications = db.collection("notifications");
  const Events = db.collection("events");
  const Expenses = db.collection("expenses");
  const Facilities = db.collection("facilities");
  const Testimonials = db.collection("testimonials");
  const FAQs = db.collection("faqs");

  const adminPassword = generatePassword();
  const studentPassword = generatePassword();
  const staffPassword = generatePassword();

  const password = await bcrypt.hash(adminPassword, 12);
  const studentPwdHash = await bcrypt.hash(studentPassword, 12);
  const staffPwdHash = await bcrypt.hash(staffPassword, 12);

  const owner = await Users.insertOne({
    name: "Admin Owner",
    email: "admin@library.com",
    password,
    role: "owner",
    phone: "9876543210",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Owner created");

  await Users.insertOne({
    name: "Rajesh Kumar",
    email: "staff@library.com",
    password: staffPwdHash,
    displayPassword: staffPassword,
    role: "staff",
    phone: "9876543211",
    isActive: true,
    staffPermissions: {
      canMarkAttendance: true,
      canAddStudents: true,
      canCollectFees: true,
      canViewSeats: true,
      canSendNotifications: false,
      canViewReports: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Staff created");

  const studentData = [
    { name: "Amit Sharma", email: "amit@student.com", phone: "9800000001", course: "UPSC Preparation", gender: "male", fatherName: "Suresh Sharma" },
    { name: "Priya Patel", email: "priya@student.com", phone: "9800000002", course: "GATE Preparation", gender: "female", fatherName: "Ramesh Patel" },
    { name: "Rahul Verma", email: "rahul@student.com", phone: "9800000003", course: "SSC CGL", gender: "male", fatherName: "Mahesh Verma" },
    { name: "Sneha Gupta", email: "sneha@student.com", phone: "9800000004", course: "CA Foundation", gender: "female", fatherName: "Vikram Gupta" },
    { name: "Arjun Singh", email: "arjun@student.com", phone: "9800000005", course: "NEET Preparation", gender: "male", fatherName: "Dinesh Singh" },
  ];

  const studentIds: mongoose.Types.ObjectId[] = [];
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    const result = await Users.insertOne({
      name: s.name,
      email: s.email,
      password: studentPwdHash,
      displayPassword: studentPassword,
      role: "student",
      phone: s.phone,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    studentIds.push(result.insertedId);

    await StudentProfiles.insertOne({
      userId: result.insertedId,
      studentId: `LIB-2024-${String(i + 1).padStart(3, "0")}`,
      fatherName: s.fatherName,
      gender: s.gender,
      course: s.course,
      address: "123 Main Street, City",
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log("5 Students created");

  const libraryName = process.env.NEXT_PUBLIC_LIBRARY_NAME || "Prestige Study Library";
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "9876543210";
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@prestigestudy.in";
  const address = process.env.NEXT_PUBLIC_ADDRESS || "45, MG Road, Near Central Library, Jaipur, Rajasthan - 302001";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9876543210";
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "INR";
  const timezone = process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Kolkata";
  const dateFormat = process.env.NEXT_PUBLIC_DATE_FORMAT || "DD/MM/YYYY";
  const receiptPrefix = process.env.NEXT_PUBLIC_RECEIPT_PREFIX || "RCP";
  const studentIdPrefix = process.env.NEXT_PUBLIC_STUDENT_ID_PREFIX || "LIB";
  const heroHeading = process.env.NEXT_PUBLIC_HERO_HEADING || "Your Dedicated Study Space for Success";
  const heroDescription = process.env.NEXT_PUBLIC_HERO_DESCRIPTION || "A quiet, comfortable, and well-equipped study library for serious students preparing for competitive exams.";

  await LibrarySettings.insertOne({
    libraryName,
    heroHeading,
    heroDescription,
    aboutContent: `${libraryName} is the premier study space in the city, providing a conducive environment for students preparing for competitive exams. With 24/7 power backup, high-speed WiFi, and comfortable seating, we ensure students can focus entirely on their studies.`,
    contactPhone,
    contactEmail,
    address,
    whatsappNumber,
    currency,
    timezone,
    dateFormat,
    receiptPrefix,
    studentIdPrefix,
    libraryTimings: { openTime: "06:00", closeTime: "22:00", openDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    seatSharingEnabled: false,
    lateFeeEnabled: true,
    lateFeeAmount: 50,
    membershipExpiryGraceDays: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("Library settings created");

  const room1 = await Rooms.insertOne({ name: "Hall A - Ground Floor", floor: "Ground", description: "Main study hall", totalSeats: 12, isActive: true, createdAt: new Date(), updatedAt: new Date() });
  const room2 = await Rooms.insertOne({ name: "Hall B - First Floor", floor: "First", description: "Quiet study hall", totalSeats: 8, isActive: true, createdAt: new Date(), updatedAt: new Date() });

  const seatIds: mongoose.Types.ObjectId[] = [];
  for (const num of ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12"]) {
    const r = await Seats.insertOne({ seatNumber: num, roomId: room1.insertedId, floor: "Ground", features: ["AC", "Power Outlet"], status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() });
    seatIds.push(r.insertedId);
  }
  for (const num of ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"]) {
    const r = await Seats.insertOne({ seatNumber: num, roomId: room2.insertedId, floor: "First", features: ["AC", "Power Outlet"], status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() });
    seatIds.push(r.insertedId);
  }
  console.log("20 Seats created");

  const fullDayPlan = await MembershipPlans.insertOne({
    name: "Full Day Access", description: "Unlimited access from 6 AM to 10 PM", shiftType: "full_day",
    monthlyFee: 1500, admissionFee: 200, securityDeposit: 500, duration: 1, durationUnit: "months",
    gracePeriod: 7, lateFee: 50, facilities: ["WiFi", "AC", "Power Backup", "Drinking Water", "CCTV", "Locker"],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  });

  const morningPlan = await MembershipPlans.insertOne({
    name: "Morning Shift", description: "Access from 6 AM to 2 PM", shiftType: "morning", startTime: "06:00", endTime: "14:00",
    monthlyFee: 800, admissionFee: 100, securityDeposit: 300, duration: 1, durationUnit: "months",
    gracePeriod: 7, lateFee: 30, facilities: ["WiFi", "AC", "Power Backup", "Drinking Water"],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  });

  const eveningPlan = await MembershipPlans.insertOne({
    name: "Evening Shift", description: "Access from 2 PM to 10 PM", shiftType: "evening", startTime: "14:00", endTime: "22:00",
    monthlyFee: 800, admissionFee: 100, securityDeposit: 300, duration: 1, durationUnit: "months",
    gracePeriod: 7, lateFee: 30, facilities: ["WiFi", "AC", "Power Backup", "Drinking Water"],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  });
  console.log("3 Plans created");

  const membershipConfigs = [
    { si: 0, plan: fullDayPlan.insertedId, shift: "full_day", sei: 0, amount: 1500 },
    { si: 1, plan: fullDayPlan.insertedId, shift: "full_day", sei: 1, amount: 1500 },
    { si: 2, plan: morningPlan.insertedId, shift: "morning", sei: 2, amount: 800 },
    { si: 3, plan: eveningPlan.insertedId, shift: "evening", sei: 10, amount: 800 },
    { si: 4, plan: fullDayPlan.insertedId, shift: "full_day", sei: 3, amount: 1500 },
  ];

  const membershipIds: mongoose.Types.ObjectId[] = [];
  for (const m of membershipConfigs) {
    const startDate = new Date();
    startDate.setDate(1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const result = await Memberships.insertOne({
      studentId: studentIds[m.si], planId: m.plan, seatId: seatIds[m.sei], shiftType: m.shift,
      startDate, endDate, status: "active", totalAmount: m.amount + 200,
      amountPaid: m.amount, pendingAmount: 200, securityDepositPaid: true, admissionFeePaid: true,
      assignedBy: owner.insertedId, createdAt: new Date(), updatedAt: new Date(),
    });
    membershipIds.push(result.insertedId);
    await Seats.updateOne({ _id: seatIds[m.sei] }, { $set: { status: "occupied" } });
  }
  console.log("5 Memberships created");

  for (let i = 0; i < membershipIds.length; i++) {
    const amount = membershipConfigs[i].amount + 200;
    await Payments.insertOne({
      studentId: studentIds[i], membershipId: membershipIds[i], planId: membershipConfigs[i].plan,
      amount, discount: 0, finalAmount: amount,
      method: i < 3 ? "online" : "cash", purpose: "admission", status: "completed",
      receiptNumber: `RCP24${String(i + 1).padStart(4, "0")}`,
      paymentDate: new Date(Date.now() - (20 - i) * 86400000),
      notes: "Initial admission payment", receivedBy: owner.insertedId,
      isArchived: false, createdAt: new Date(), updatedAt: new Date(),
    });
  }
  console.log("5 Payments created");

  const today = new Date();
  for (let d = 1; d <= today.getDate(); d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), d);
    if (date.getDay() === 0) continue;
    for (let i = 0; i < studentIds.length; i++) {
      const statuses = ["present", "present", "present", "late", "absent"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      await Attendances.insertOne({
        studentId: studentIds[i], date, status,
        checkInTime: status !== "absent" ? `${6 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}` : undefined,
        markedBy: owner.insertedId, createdAt: new Date(), updatedAt: new Date(),
      });
    }
  }
  console.log("Attendance records created");

  await Notifications.insertOne({
    title: `Welcome to ${libraryName}`, message: "Welcome to our library! We wish you all the best in your exam preparation.",
    type: "general", targetAudience: "all", specificStudentIds: studentIds, sentBy: owner.insertedId,
    sendEmail: false, emailSent: false,
    recipients: studentIds.map((id) => ({ studentId: id, read: false, delivered: true })),
    createdAt: new Date(), updatedAt: new Date(),
  });
  console.log("Notifications created");

  const eventDate1 = new Date(); eventDate1.setDate(eventDate1.getDate() + 5);
  await Events.insertOne({
    title: "Study Motivation Seminar", description: "Join us for an inspiring seminar on effective study techniques and time management.",
    eventDate: eventDate1, startTime: "10:00", endTime: "12:00", location: "Library Hall A",
    targetAudience: "all", isActive: true, createdBy: owner.insertedId, createdAt: new Date(), updatedAt: new Date(),
  });

  const eventDate2 = new Date(); eventDate2.setDate(eventDate2.getDate() + 15);
  await Events.insertOne({
    title: "Library Closed - Republic Day", description: "The library will be closed on Republic Day. All members are requested to plan accordingly.",
    eventDate: eventDate2, location: "All Halls", targetAudience: "all", isActive: true,
    createdBy: owner.insertedId, createdAt: new Date(), updatedAt: new Date(),
  });
  console.log("Events created");

  const expenseData = [
    { category: "Rent", amount: 25000, description: "Monthly rent", method: "bank_transfer", vendor: "Property Owner" },
    { category: "Electricity", amount: 4500, description: "Electricity bill", method: "upi", vendor: "BSES" },
    { category: "Internet", amount: 1200, description: "Broadband", method: "upi", vendor: "ACT Fibernet" },
    { category: "Cleaning", amount: 3000, description: "Cleaning service", method: "cash", vendor: "CleanPro" },
    { category: "Drinking Water", amount: 800, description: "Water maintenance", method: "cash" },
  ];
  for (let i = 0; i < expenseData.length; i++) {
    const e = expenseData[i];
    const date = new Date(); date.setDate(date.getDate() - i * 3);
    await Expenses.insertOne({
      date, category: e.category, amount: e.amount, paymentMethod: e.method,
      description: e.description, vendor: e.vendor, recordedBy: owner.insertedId,
      createdAt: new Date(), updatedAt: new Date(),
    });
  }
  console.log("Expenses created");

  const facilityData = [
    { name: "Comfortable Study Seats", icon: "\uD83D\uDCDA", sortOrder: 1 },
    { name: "High-Speed WiFi", icon: "\uD83D\uDCF6", sortOrder: 2 },
    { name: "Air Conditioning", icon: "\u2744\uFE0F", sortOrder: 3 },
    { name: "Drinking Water", icon: "\uD83D\uDCA7", sortOrder: 4 },
    { name: "Power Backup", icon: "\u26A1", sortOrder: 5 },
    { name: "Charging Points", icon: "\uD83D\uDD0C", sortOrder: 6 },
    { name: "CCTV Security", icon: "\uD83D\uDD12", sortOrder: 7 },
    { name: "Personal Lockers", icon: "\uD83D\uDD10", sortOrder: 8 },
    { name: "Silent Environment", icon: "\uD83E\uDD2B", sortOrder: 9 },
    { name: "Clean Washrooms", icon: "\uD83D\uDEBF", sortOrder: 10 },
  ];
  for (const f of facilityData) {
    await Facilities.insertOne({ ...f, description: f.name, isActive: true, createdAt: new Date(), updatedAt: new Date() });
  }

  const testimonialData = [
    { name: "Rahul K., UPSC Aspirant", content: "Best library in the city! The environment is perfect for focused study.", rating: 5 },
    { name: "Priya M., GATE Preparation", content: "Excellent facilities and very affordable. The WiFi speed is great.", rating: 5 },
    { name: "Amit S., SSC CGL", content: "Clean, quiet, and well-organized. Highly recommended!", rating: 5 },
  ];
  for (const t of testimonialData) {
    await Testimonials.insertOne({ ...t, isActive: true, createdAt: new Date(), updatedAt: new Date() });
  }

  const faqData = [
    { question: "What are the library timings?", answer: "The library is open from 6:00 AM to 10:00 PM, all 7 days.", sortOrder: 1 },
    { question: "Is WiFi available?", answer: "Yes, high-speed WiFi is available for all members at no extra cost.", sortOrder: 2 },
    { question: "Can I change my seat?", answer: "Yes, contact the admin or raise a support request.", sortOrder: 3 },
    { question: "What payment methods are accepted?", answer: "UPI, debit/credit cards (online), cash, and bank transfer.", sortOrder: 4 },
    { question: "Is there a security deposit?", answer: "Yes, a refundable security deposit of Rs.300-500 depending on the plan.", sortOrder: 5 },
  ];
  for (const f of faqData) {
    await FAQs.insertOne({ ...f, isActive: true, createdAt: new Date(), updatedAt: new Date() });
  }

  console.log("\n=== Seed Complete ===");
  console.log("Owner login:  admin@library.com /", adminPassword);
  console.log("Staff login:  staff@library.com /", staffPassword);
  console.log("Student login: amit@student.com /", studentPassword);
  console.log("====================");

  await mongoose.disconnect();
}

seed().catch((err) => { console.error("Seed error:", err); process.exit(1); });
