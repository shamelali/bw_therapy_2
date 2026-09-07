// Demo data for the therapy marketplace — enables full frontend demo without a database

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "provider" | "admin";
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface DemoProvider {
  id: string;
  userId: string;
  businessName: string;
  type: "therapist" | "massage_center" | "spa" | "wellness_center" | "chiropractor" | "physiotherapy";
  tagline: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  imageUrl: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoService {
  id: string;
  providerId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoBooking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "declined";
  notes: string | null;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface DemoReview {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DemoAvailability {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DEMO_PASSWORD_HASH = "$2a$12$LJ3m4ys3HzHdlN3nYv1cEeKo9V7XKb0wOY1XtYJmZ3qFQJ1x9QJ5O";

export const demoUsers: DemoUser[] = [
  { id: "usr-admin-001", name: "Admin User", email: "admin@demo.com", passwordHash: DEMO_PASSWORD_HASH, role: "admin", phone: "+6012-345-6789", avatarUrl: null, createdAt: "2025-01-01T00:00:00Z" },
  { id: "usr-provider-001", name: "Sarah Chen", email: "sarah@demo.com", passwordHash: DEMO_PASSWORD_HASH, role: "provider", phone: "+6012-345-6789", avatarUrl: null, createdAt: "2025-01-02T00:00:00Z" },
  { id: "usr-provider-002", name: "Ahmad Razak", email: "ahmad@demo.com", passwordHash: DEMO_PASSWORD_HASH, role: "provider", phone: "+6012-345-6790", avatarUrl: null, createdAt: "2025-01-03T00:00:00Z" },
  { id: "usr-provider-003", name: "Priya Nair", email: "priya@demo.com", passwordHash: DEMO_PASSWORD_HASH, role: "provider", phone: "+6012-345-6791", avatarUrl: null, createdAt: "2025-01-04T00:00:00Z" },
  { id: "usr-provider-004", name: "David Wong", email: "david@demo.com", passwordHash: DEMO_PASSWORD_HASH, role: "provider", phone: "+6012-345-6792", avatarUrl: null, createdAt: "2025-01-05T00:00:00Z" },
  { id: "usr-provider-005", name: "Nurul Ain", email: "nurul@demo.com", passwordHash: DEMO_PASSWORD_HASH, role: "provider", phone: "+6012-345-6793", avatarUrl: null, createdAt: "2025-01-06T00:00:00Z" },
  { id: "usr-customer-001", name: "John Doe", email: "john@demo.com", passwordHash: DEMO_PASSWORD_HASH, role: "customer", phone: "+6019-876-5432", avatarUrl: null, createdAt: "2025-01-10T00:00:00Z" },
  { id: "usr-customer-002", name: "Jane Smith", email: "jane@demo.com", passwordHash: DEMO_PASSWORD_HASH, role: "customer", phone: "+6019-876-5433", avatarUrl: null, createdAt: "2025-01-11T00:00:00Z" },
];

export const demoProviders: DemoProvider[] = [
  { id: "prv-001", userId: "usr-provider-001", businessName: "Serenity Wellness", type: "therapist", tagline: "Holistic healing for mind & body", description: "Licensed therapist offering cognitive behavioral therapy, mindfulness, and wellness counseling. Over 10 years of experience.", city: "Kuala Lumpur", address: "123 Jalan Tun Razak, 50400 KL", phone: "+6012-345-6789", email: "sarah@demo.com", imageUrl: "", priceFrom: 120, rating: 4.8, reviewCount: 24, isActive: true, createdAt: "2025-01-02T00:00:00Z", updatedAt: "2025-01-02T00:00:00Z" },
  { id: "prv-002", userId: "usr-provider-002", businessName: "Traditional Touch", type: "massage_center", tagline: "Authentic Malay & Thai massage", description: "Traditional Malay urut and Thai massage techniques passed down through generations. Certified therapists.", city: "Petaling Jaya", address: "45 SS2, 47300 PJ", phone: "+6012-345-6790", email: "ahmad@demo.com", imageUrl: "", priceFrom: 80, rating: 4.9, reviewCount: 31, isActive: true, createdAt: "2025-01-03T00:00:00Z", updatedAt: "2025-01-03T00:00:00Z" },
  { id: "prv-003", userId: "usr-provider-003", businessName: "PhysioActive", type: "physiotherapy", tagline: "Recover. Restore. Rebuild.", description: "Expert physiotherapy for sports injuries, post-surgery rehabilitation, and chronic pain management.", city: "Bangsar", address: "78 Jalan Bangsar, 59000 KL", phone: "+6012-345-6791", email: "priya@demo.com", imageUrl: "", priceFrom: 150, rating: 4.7, reviewCount: 18, isActive: true, createdAt: "2025-01-04T00:00:00Z", updatedAt: "2025-01-04T00:00:00Z" },
  { id: "prv-004", userId: "usr-provider-004", businessName: "SpineAlign", type: "chiropractor", tagline: "Your spine, our priority", description: "Professional chiropractic care for back pain, neck pain, and posture correction. Gentle, precise adjustments.", city: "Mont Kiara", address: "12 Plaza Mont Kiara, 50480 KL", phone: "+6012-345-6792", email: "david@demo.com", imageUrl: "", priceFrom: 100, rating: 4.6, reviewCount: 12, isActive: true, createdAt: "2025-01-05T00:00:00Z", updatedAt: "2025-01-05T00:00:00Z" },
  { id: "prv-005", userId: "usr-provider-005", businessName: "Nurul's Wellness Spa", type: "spa", tagline: "Traditional Malay wellness rituals", description: "Traditional Malay wellness rituals combining ancient herbal remedies with modern relaxation techniques.", city: "Bangsar South", address: "5 The Strand, 59200 KL", phone: "+6012-345-6793", email: "nurul@demo.com", imageUrl: "", priceFrom: 150, rating: 4.5, reviewCount: 9, isActive: true, createdAt: "2025-01-06T00:00:00Z", updatedAt: "2025-01-06T00:00:00Z" },
];

export const demoServices: DemoService[] = [
  { id: "svc-001", providerId: "prv-001", name: "Cognitive Behavioral Therapy", description: "Structured therapy to identify and change negative thought patterns", durationMinutes: 60, price: 150, category: "Therapy", imageUrl: null, isActive: true, createdAt: "2025-01-02T00:00:00Z", updatedAt: "2025-01-02T00:00:00Z" },
  { id: "svc-002", providerId: "prv-001", name: "Mindfulness Counseling", description: "Guided mindfulness practice for stress and anxiety relief", durationMinutes: 45, price: 120, category: "Therapy", imageUrl: null, isActive: true, createdAt: "2025-01-02T00:00:00Z", updatedAt: "2025-01-02T00:00:00Z" },
  { id: "svc-003", providerId: "prv-002", name: "Traditional Malay Urut", description: "Full-body traditional Malay massage technique", durationMinutes: 90, price: 120, category: "Massage", imageUrl: null, isActive: true, createdAt: "2025-01-03T00:00:00Z", updatedAt: "2025-01-03T00:00:00Z" },
  { id: "svc-004", providerId: "prv-002", name: "Thai Deep Tissue Massage", description: "Deep tissue therapy using authentic Thai techniques", durationMinutes: 60, price: 100, category: "Massage", imageUrl: null, isActive: true, createdAt: "2025-01-03T00:00:00Z", updatedAt: "2025-01-03T00:00:00Z" },
  { id: "svc-005", providerId: "prv-002", name: "Aromatherapy Massage", description: "Relaxing massage with essential oil blends", durationMinutes: 75, price: 80, category: "Massage", imageUrl: null, isActive: true, createdAt: "2025-01-03T00:00:00Z", updatedAt: "2025-01-03T00:00:00Z" },
  { id: "svc-006", providerId: "prv-003", name: "Sports Injury Rehab", description: "Targeted rehabilitation for sports-related injuries", durationMinutes: 60, price: 180, category: "Physiotherapy", imageUrl: null, isActive: true, createdAt: "2025-01-04T00:00:00Z", updatedAt: "2025-01-04T00:00:00Z" },
  { id: "svc-007", providerId: "prv-003", name: "Pain Management", description: "Chronic pain assessment and treatment plan", durationMinutes: 45, price: 150, category: "Physiotherapy", imageUrl: null, isActive: true, createdAt: "2025-01-04T00:00:00Z", updatedAt: "2025-01-04T00:00:00Z" },
  { id: "svc-008", providerId: "prv-004", name: "Spinal Adjustment", description: "Chiropractic spinal manipulation and alignment", durationMinutes: 30, price: 100, category: "Chiropractic", imageUrl: null, isActive: true, createdAt: "2025-01-05T00:00:00Z", updatedAt: "2025-01-05T00:00:00Z" },
  { id: "svc-009", providerId: "prv-004", name: "Back Pain Relief", description: "Targeted treatment for lower back pain", durationMinutes: 30, price: 100, category: "Chiropractic", imageUrl: null, isActive: true, createdAt: "2025-01-05T00:00:00Z", updatedAt: "2025-01-05T00:00:00Z" },
  { id: "svc-010", providerId: "prv-004", name: "Posture Correction", description: "Comprehensive posture analysis and correction program", durationMinutes: 45, price: 130, category: "Chiropractic", imageUrl: null, isActive: true, createdAt: "2025-01-05T00:00:00Z", updatedAt: "2025-01-05T00:00:00Z" },
  { id: "svc-011", providerId: "prv-005", name: "Signature Spa Package", description: "Full body treatment with traditional Malay herbs", durationMinutes: 120, price: 280, category: "Spa", imageUrl: null, isActive: true, createdAt: "2025-01-06T00:00:00Z", updatedAt: "2025-01-06T00:00:00Z" },
  { id: "svc-012", providerId: "prv-005", name: "Facial Rejuvenation", description: "Traditional Malay facial with natural herbal ingredients", durationMinutes: 60, price: 150, category: "Beauty", imageUrl: null, isActive: true, createdAt: "2025-01-06T00:00:00Z", updatedAt: "2025-01-06T00:00:00Z" },
];

export const demoBookings: DemoBooking[] = [
  { id: "bkg-001", customerId: "usr-customer-001", providerId: "prv-001", serviceId: "svc-001", date: "2025-02-15", startTime: "10:00", endTime: "11:00", status: "completed", notes: "First session went well", totalPrice: 150, createdAt: "2025-02-10T00:00:00Z", updatedAt: "2025-02-15T11:00:00Z" },
  { id: "bkg-002", customerId: "usr-customer-001", providerId: "prv-002", serviceId: "svc-003", date: "2025-02-20", startTime: "14:00", endTime: "15:30", status: "confirmed", notes: null, totalPrice: 120, createdAt: "2025-02-18T00:00:00Z", updatedAt: "2025-02-18T00:00:00Z" },
  { id: "bkg-003", customerId: "usr-customer-002", providerId: "prv-003", serviceId: "svc-006", date: "2025-02-22", startTime: "09:00", endTime: "10:00", status: "pending", notes: "Knee injury from running", totalPrice: 180, createdAt: "2025-02-20T00:00:00Z", updatedAt: "2025-02-20T00:00:00Z" },
  { id: "bkg-004", customerId: "usr-customer-002", providerId: "prv-005", serviceId: "svc-011", date: "2025-03-01", startTime: "16:00", endTime: "18:00", status: "cancelled", notes: "Rescheduling needed", totalPrice: 280, createdAt: "2025-02-25T00:00:00Z", updatedAt: "2025-02-28T00:00:00Z" },
];

export const demoReviews: DemoReview[] = [
  { id: "rev-001", bookingId: "bkg-001", providerId: "prv-001", customerId: "usr-customer-001", rating: 5, comment: "Sarah is an amazing therapist. She helped me work through my anxiety with practical tools I still use daily.", createdAt: "2025-02-16T00:00:00Z" },
  { id: "rev-002", bookingId: "bkg-002", providerId: "prv-002", customerId: "usr-customer-001", rating: 5, comment: "Best massage I've ever had. The traditional Malay urut was incredibly effective for my back pain.", createdAt: "2025-02-21T00:00:00Z" },
];

export const demoAvailability: DemoAvailability[] = [
  { id: "avl-001", providerId: "prv-001", dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: "avl-002", providerId: "prv-001", dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: "avl-003", providerId: "prv-001", dayOfWeek: 3, startTime: "10:00", endTime: "16:00", isActive: true },
  { id: "avl-004", providerId: "prv-001", dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: "avl-005", providerId: "prv-001", dayOfWeek: 5, startTime: "09:00", endTime: "14:00", isActive: true },
  { id: "avl-006", providerId: "prv-002", dayOfWeek: 1, startTime: "10:00", endTime: "20:00", isActive: true },
  { id: "avl-007", providerId: "prv-002", dayOfWeek: 2, startTime: "10:00", endTime: "20:00", isActive: true },
  { id: "avl-008", providerId: "prv-002", dayOfWeek: 3, startTime: "10:00", endTime: "20:00", isActive: true },
  { id: "avl-009", providerId: "prv-002", dayOfWeek: 4, startTime: "10:00", endTime: "20:00", isActive: true },
  { id: "avl-010", providerId: "prv-002", dayOfWeek: 5, startTime: "10:00", endTime: "21:00", isActive: true },
  { id: "avl-011", providerId: "prv-002", dayOfWeek: 6, startTime: "11:00", endTime: "18:00", isActive: true },
  { id: "avl-012", providerId: "prv-003", dayOfWeek: 1, startTime: "08:00", endTime: "18:00", isActive: true },
  { id: "avl-013", providerId: "prv-003", dayOfWeek: 3, startTime: "08:00", endTime: "18:00", isActive: true },
  { id: "avl-014", providerId: "prv-003", dayOfWeek: 5, startTime: "08:00", endTime: "14:00", isActive: true },
  { id: "avl-015", providerId: "prv-004", dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isActive: true },
  { id: "avl-016", providerId: "prv-004", dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isActive: true },
  { id: "avl-017", providerId: "prv-004", dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isActive: true },
  { id: "avl-018", providerId: "prv-005", dayOfWeek: 1, startTime: "10:00", endTime: "21:00", isActive: true },
  { id: "avl-019", providerId: "prv-005", dayOfWeek: 2, startTime: "10:00", endTime: "21:00", isActive: true },
  { id: "avl-020", providerId: "prv-005", dayOfWeek: 3, startTime: "10:00", endTime: "21:00", isActive: true },
  { id: "avl-021", providerId: "prv-005", dayOfWeek: 4, startTime: "10:00", endTime: "21:00", isActive: true },
  { id: "avl-022", providerId: "prv-005", dayOfWeek: 5, startTime: "10:00", endTime: "22:00", isActive: true },
  { id: "avl-023", providerId: "prv-005", dayOfWeek: 6, startTime: "10:00", endTime: "20:00", isActive: true },
];

export function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
