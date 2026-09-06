import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

export const userRoleEnum = pgEnum("user_role", ["customer", "provider", "admin"]);

export const providerTypeEnum = pgEnum("provider_type", [
  "therapist",
  "massage_center",
  "spa",
  "wellness_center",
  "chiropractor",
  "physiotherapy",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "declined",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

export const providers = pgTable("providers", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  type: providerTypeEnum("type").notNull().default("therapist"),
  tagline: text("tagline"),
  description: text("description"),
  city: text("city").notNull(),
  state: text("state"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  imageUrl: text("image_url"),
  priceFrom: numeric("price_from", { precision: 10, scale: 2 }).notNull().default("0"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  providerId: text("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  category: text("category").notNull().default("Massage"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const availability = pgTable("availability", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  providerId: text("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  customerId: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  bookingIdx: uniqueIndex("reviews_booking_idx").on(table.bookingId),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  provider: one(providers, { fields: [users.id], references: [providers.userId] }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
  owner: one(users, { fields: [providers.userId], references: [users.id] }),
  services: many(services),
  availability: many(availability),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(providers, { fields: [services.providerId], references: [providers.id] }),
  bookings: many(bookings),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  provider: one(providers, { fields: [availability.providerId], references: [providers.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, { fields: [bookings.customerId], references: [users.id] }),
  provider: one(providers, { fields: [bookings.providerId], references: [providers.id] }),
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
  review: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, { fields: [reviews.bookingId], references: [bookings.id] }),
  provider: one(providers, { fields: [reviews.providerId], references: [providers.id] }),
  customer: one(users, { fields: [reviews.customerId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Provider = typeof providers.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Availability = typeof availability.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
