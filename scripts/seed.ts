import "dotenv/config";
import { db, pool } from "../src/db";
import { availability, bookings, providers, reviews, services, users } from "../src/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data (order matters due to FKs)
  await db.delete(reviews);
  await db.delete(bookings);
  await db.delete(availability);
  await db.delete(services);
  await db.delete(providers);
  await db.delete(users);

  const passwordHash = await bcrypt.hash("password123", 10);

  const [admin] = await db
    .insert(users)
    .values({ name: "Admin User", email: "admin@serenity.app", passwordHash, role: "admin" })
    .returning();

  const customerDefs = [
    { name: "Amelia Clarke", email: "amelia@example.com", phone: "(512) 555-0148" },
    { name: "James Whitfield", email: "james@example.com", phone: "(206) 555-0173" },
    { name: "Sophia Martinez", email: "sophia@example.com", phone: "(303) 555-0122" },
    { name: "Liam O'Connor", email: "liam@example.com", phone: "(312) 555-0199" },
    { name: "Olivia Chen", email: "olivia@example.com", phone: "(512) 555-0110" },
  ];
  const customers = [];
  for (const c of customerDefs) {
    const [row] = await db.insert(users).values({ ...c, passwordHash, role: "customer" }).returning();
    customers.push(row);
  }

  const providerDefs = [
    {
      ownerName: "Harmony Wellness Spa Team",
      ownerEmail: "harmony.wellness@example.com",
      businessName: "Harmony Wellness Spa",
      type: "massage_center" as const,
      city: "Austin",
      tagline: "Where relaxation meets expertise",
      description:
        "Harmony Wellness Spa has been Austin's go-to destination for therapeutic massage and spa treatments since 2015. Our licensed therapists tailor every session to your needs.",
      address: "214 Congress Ave",
      phone: "(512) 555-0100",
      priceFrom: 65,
      rating: 4.8,
      reviewCount: 0,
      services: [
        { name: "Swedish Massage", description: "A gentle full-body massage to relax and rejuvenate.", durationMinutes: 60, price: 89, category: "Massage" },
        { name: "Deep Tissue Massage", description: "Targeted pressure to relieve chronic muscle tension.", durationMinutes: 60, price: 109, category: "Massage" },
        { name: "Hot Stone Therapy", description: "Warm stones melt away stress and soothe sore muscles.", durationMinutes: 90, price: 139, category: "Massage" },
        { name: "Aromatherapy Massage", description: "Essential oils combined with massage for total relaxation.", durationMinutes: 60, price: 99, category: "Massage" },
      ],
    },
    {
      ownerName: "Elena Torres",
      ownerEmail: "elena.torres@example.com",
      businessName: "Elena Torres, LMT",
      type: "therapist" as const,
      city: "Austin",
      tagline: "Licensed massage therapist, 12 years experience",
      description:
        "I specialize in sports recovery and deep tissue work for athletes and desk workers alike. Every session is customized to your body's needs.",
      address: "900 South Lamar Blvd",
      phone: "(512) 555-0187",
      priceFrom: 75,
      rating: 4.9,
      reviewCount: 0,
      services: [
        { name: "Sports Massage", description: "Improve performance and speed up recovery.", durationMinutes: 60, price: 95, category: "Massage" },
        { name: "Trigger Point Therapy", description: "Relieve tight knots causing referred pain.", durationMinutes: 45, price: 85, category: "Therapy" },
        { name: "Prenatal Massage", description: "Safe, soothing massage for expecting mothers.", durationMinutes: 60, price: 99, category: "Massage" },
      ],
    },
    {
      ownerName: "Zenith Massage Team",
      ownerEmail: "zenith.massage@example.com",
      businessName: "Zenith Massage Therapy",
      type: "massage_center" as const,
      city: "Seattle",
      tagline: "Elevate your everyday",
      description:
        "Zenith brings together a team of certified massage therapists offering a full menu of therapeutic and relaxation treatments in the heart of Seattle.",
      address: "1200 Pike St",
      phone: "(206) 555-0142",
      priceFrom: 70,
      rating: 4.6,
      reviewCount: 0,
      services: [
        { name: "Swedish Massage", description: "Classic relaxation massage for stress relief.", durationMinutes: 60, price: 90, category: "Massage" },
        { name: "Reflexology", description: "Pressure point therapy focused on feet and hands.", durationMinutes: 45, price: 70, category: "Wellness" },
        { name: "Couples Massage", description: "Side-by-side massage experience for two.", durationMinutes: 60, price: 190, category: "Massage" },
      ],
    },
    {
      ownerName: "Pure Bliss Team",
      ownerEmail: "purebliss.spa@example.com",
      businessName: "Pure Bliss Day Spa",
      type: "spa" as const,
      city: "Seattle",
      tagline: "Your escape from the everyday",
      description:
        "A full-service day spa offering massages, facials and body treatments in a serene, modern setting overlooking Elliott Bay.",
      address: "88 Union St",
      phone: "(206) 555-0199",
      priceFrom: 80,
      rating: 4.7,
      reviewCount: 0,
      services: [
        { name: "Facial Rejuvenation", description: "Deep cleanse and hydrate for glowing skin.", durationMinutes: 50, price: 110, category: "Facial" },
        { name: "Hot Stone Therapy", description: "Warm basalt stones ease tension and improve circulation.", durationMinutes: 90, price: 149, category: "Massage" },
        { name: "Body Scrub & Wrap", description: "Exfoliating scrub followed by a hydrating wrap.", durationMinutes: 75, price: 129, category: "Body Treatment" },
      ],
    },
    {
      ownerName: "Marcus Reed",
      ownerEmail: "marcus.reed@example.com",
      businessName: "Golden Hands Therapy",
      type: "therapist" as const,
      city: "Denver",
      tagline: "Personalized therapeutic massage",
      description:
        "Marcus is a nationally certified massage therapist focused on injury recovery, mobility and stress reduction for active clients in Denver.",
      address: "455 16th St Mall",
      phone: "(303) 555-0166",
      priceFrom: 60,
      rating: 4.5,
      reviewCount: 0,
      services: [
        { name: "Deep Tissue Massage", description: "Firm pressure to release deep muscle tension.", durationMinutes: 60, price: 92, category: "Massage" },
        { name: "Sports Massage", description: "Pre/post workout massage for athletes.", durationMinutes: 45, price: 75, category: "Massage" },
      ],
    },
    {
      ownerName: "Align Chiropractic Team",
      ownerEmail: "align.chiro@example.com",
      businessName: "Align Chiropractic Studio",
      type: "chiropractor" as const,
      city: "Denver",
      tagline: "Realign. Restore. Recover.",
      description:
        "Our chiropractors use evidence-based techniques to relieve pain, restore mobility, and help you move better every day.",
      address: "2020 Larimer St",
      phone: "(303) 555-0134",
      priceFrom: 55,
      rating: 4.4,
      reviewCount: 0,
      services: [
        { name: "Chiropractic Adjustment", description: "Manual spinal adjustment to relieve pain and improve alignment.", durationMinutes: 30, price: 65, category: "Chiropractic" },
        { name: "Posture Assessment", description: "Full posture and mobility evaluation with a treatment plan.", durationMinutes: 45, price: 85, category: "Chiropractic" },
      ],
    },
    {
      ownerName: "Revive Physio Team",
      ownerEmail: "revive.physio@example.com",
      businessName: "Revive Physiotherapy Clinic",
      type: "physiotherapy" as const,
      city: "Chicago",
      tagline: "Move without limits",
      description:
        "Revive's licensed physiotherapists help patients recover from injury, surgery, and chronic pain with individualized treatment plans.",
      address: "330 N Michigan Ave",
      phone: "(312) 555-0155",
      priceFrom: 90,
      rating: 4.9,
      reviewCount: 0,
      services: [
        { name: "Physical Therapy Session", description: "One-on-one session targeting your recovery goals.", durationMinutes: 60, price: 140, category: "Physiotherapy" },
        { name: "Sports Injury Rehab", description: "Specialized rehab plan for sports-related injuries.", durationMinutes: 45, price: 120, category: "Physiotherapy" },
      ],
    },
    {
      ownerName: "Tranquil Roots Team",
      ownerEmail: "tranquilroots@example.com",
      businessName: "Tranquil Roots Wellness Center",
      type: "wellness_center" as const,
      city: "Chicago",
      tagline: "Holistic care for mind & body",
      description:
        "A holistic wellness center offering massage, acupuncture-informed bodywork, and mindfulness-based stress reduction programs.",
      address: "77 W Wacker Dr",
      phone: "(312) 555-0188",
      priceFrom: 68,
      rating: 4.3,
      reviewCount: 0,
      services: [
        { name: "Aromatherapy Massage", description: "Calming massage using therapeutic essential oils.", durationMinutes: 60, price: 95, category: "Wellness" },
        { name: "Reflexology", description: "Balance the body through pressure point therapy.", durationMinutes: 45, price: 72, category: "Wellness" },
        { name: "Mindfulness Bodywork", description: "Gentle bodywork paired with guided breathing.", durationMinutes: 50, price: 88, category: "Wellness" },
      ],
    },
  ];

  const createdProviders: { provider: typeof providers.$inferSelect; services: (typeof services.$inferSelect)[] }[] = [];

  for (const def of providerDefs) {
    const [owner] = await db
      .insert(users)
      .values({ name: def.ownerName, email: def.ownerEmail, passwordHash, role: "provider", phone: def.phone })
      .returning();

    const [provider] = await db
      .insert(providers)
      .values({
        userId: owner.id,
        businessName: def.businessName,
        type: def.type,
        city: def.city,
        tagline: def.tagline,
        description: def.description,
        address: def.address,
        phone: def.phone,
        email: def.ownerEmail,
        priceFrom: String(def.priceFrom),
        rating: String(def.rating),
        reviewCount: 0,
      })
      .returning();

    const createdServices = [];
    for (const s of def.services) {
      const [svc] = await db
        .insert(services)
        .values({
          providerId: provider.id,
          name: s.name,
          description: s.description,
          durationMinutes: s.durationMinutes,
          price: String(s.price),
          category: s.category,
        })
        .returning();
      createdServices.push(svc);
    }

    const weekdayHours = def.type === "spa" || def.type === "wellness_center" ? ["10:00", "18:00"] : ["09:00", "17:00"];
    for (let day = 1; day <= 5; day++) {
      await db.insert(availability).values({ providerId: provider.id, dayOfWeek: day, startTime: weekdayHours[0], endTime: weekdayHours[1] });
    }
    await db.insert(availability).values({ providerId: provider.id, dayOfWeek: 6, startTime: "10:00", endTime: "14:00" });

    createdProviders.push({ provider, services: createdServices });
  }

  // Bookings: mix of past (completed/cancelled) and future (pending/confirmed/declined)
  type BookingPlan = { customerIdx: number; providerIdx: number; serviceIdx: number; dayOffset: number; startTime: string; status: "pending" | "confirmed" | "completed" | "cancelled" | "declined"; notes?: string };

  const plans: BookingPlan[] = [
    { customerIdx: 0, providerIdx: 0, serviceIdx: 0, dayOffset: -14, startTime: "10:00", status: "completed", notes: "First time visiting, please go easy on pressure." },
    { customerIdx: 0, providerIdx: 1, serviceIdx: 0, dayOffset: -7, startTime: "13:00", status: "completed" },
    { customerIdx: 1, providerIdx: 0, serviceIdx: 1, dayOffset: -10, startTime: "11:00", status: "completed" },
    { customerIdx: 2, providerIdx: 2, serviceIdx: 0, dayOffset: -5, startTime: "15:00", status: "completed" },
    { customerIdx: 3, providerIdx: 6, serviceIdx: 0, dayOffset: -3, startTime: "09:00", status: "completed", notes: "Recovering from a knee injury." },
    { customerIdx: 4, providerIdx: 3, serviceIdx: 0, dayOffset: -2, startTime: "16:00", status: "completed" },
    { customerIdx: 1, providerIdx: 4, serviceIdx: 0, dayOffset: -20, startTime: "10:00", status: "cancelled" },
    { customerIdx: 2, providerIdx: 5, serviceIdx: 0, dayOffset: -15, startTime: "14:00", status: "declined" },
    { customerIdx: 0, providerIdx: 0, serviceIdx: 2, dayOffset: 1, startTime: "10:00", status: "pending" },
    { customerIdx: 1, providerIdx: 1, serviceIdx: 1, dayOffset: 2, startTime: "14:00", status: "pending" },
    { customerIdx: 2, providerIdx: 2, serviceIdx: 1, dayOffset: 3, startTime: "11:00", status: "confirmed" },
    { customerIdx: 3, providerIdx: 3, serviceIdx: 1, dayOffset: 4, startTime: "15:00", status: "confirmed" },
    { customerIdx: 4, providerIdx: 7, serviceIdx: 0, dayOffset: 5, startTime: "10:00", status: "pending", notes: "Prefer a quiet room if possible." },
    { customerIdx: 0, providerIdx: 6, serviceIdx: 1, dayOffset: 6, startTime: "09:00", status: "confirmed" },
    { customerIdx: 3, providerIdx: 4, serviceIdx: 0, dayOffset: 8, startTime: "13:00", status: "pending" },
    { customerIdx: 2, providerIdx: 5, serviceIdx: 1, dayOffset: 9, startTime: "10:00", status: "confirmed" },
  ];

  const reviewComments = [
    "Absolutely wonderful experience, I left feeling like a new person!",
    "Professional, punctual and very skilled. Highly recommend.",
    "Great atmosphere and the therapist really listened to my needs.",
    "Solid session, would book again. Parking was a bit tricky though.",
    "Exceeded my expectations, will definitely be a regular customer.",
    "Very relaxing and exactly what I needed after a long week.",
  ];

  let reviewIdx = 0;
  for (const plan of plans) {
    const customer = customers[plan.customerIdx];
    const { provider, services: providerServices } = createdProviders[plan.providerIdx];
    const service = providerServices[plan.serviceIdx % providerServices.length];
    const startMinutes = Number(plan.startTime.split(":")[0]) * 60 + Number(plan.startTime.split(":")[1]);
    const endMinutes = startMinutes + service.durationMinutes;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    const [booking] = await db
      .insert(bookings)
      .values({
        customerId: customer.id,
        providerId: provider.id,
        serviceId: service.id,
        date: daysFromNow(plan.dayOffset),
        startTime: plan.startTime,
        endTime,
        status: plan.status,
        notes: plan.notes,
        totalPrice: service.price,
      })
      .returning();

    if (plan.status === "completed" && reviewIdx < reviewComments.length && Math.random() > 0.2) {
      const rating = [5, 5, 4, 5, 4, 5][reviewIdx % 6];
      await db.insert(reviews).values({
        bookingId: booking.id,
        providerId: provider.id,
        customerId: customer.id,
        rating,
        comment: reviewComments[reviewIdx % reviewComments.length],
      });
      reviewIdx++;
    }
  }

  // Recalculate provider ratings from actual reviews
  for (const { provider } of createdProviders) {
    const providerReviews = await db.select().from(reviews).where(eq(reviews.providerId, provider.id));
    if (providerReviews.length > 0) {
      const avg = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
      await db
        .update(providers)
        .set({ rating: avg.toFixed(2), reviewCount: providerReviews.length })
        .where(eq(providers.id, provider.id));
    } else {
      await db.update(providers).set({ reviewCount: 0 }).where(eq(providers.id, provider.id));
    }
  }

  console.log("Seed complete!");
  console.log(`Admin login: admin@serenity.app / password123`);
  console.log(`Customer login: amelia@example.com / password123`);
  console.log(`Provider login: harmony.wellness@example.com / password123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
