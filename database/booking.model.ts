import {
  Schema,
  model,
  models,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

import { Event } from "./event.model";

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

type BookingModel = Model<IBooking>;

/**
 * Email regex validation. Ensures:
 * - Local part is non-empty and has no spaces/@ symbols
 * - Domain has at least one dot
 * - TLD has at least 2 characters
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isValidEmail(email: string): boolean {
  const trimmed = email.trim();

  if (!EMAIL_REGEX.test(trimmed)) {
    return false;
  }

  // Additional validation: no consecutive dots, no starting/ending dot in local part
  const [local, domain] = trimmed.split("@");

  if (!local || local.startsWith(".") || local.endsWith(".")) {
    return false;
  }

  if (local.includes("..") || domain?.startsWith(".") || domain?.endsWith(".")) {
    return false;
  }

  // Verify reasonable length limits (RFC 5321)
  if (local.length > 64 || domain.length > 255) {
    return false;
  }

  return true;
}

const bookingSchema = new Schema<IBooking, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

// Compound unique index: prevent duplicate bookings for the same event/email pair
bookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

bookingSchema.pre("save", async function () {
  const email = this.email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    throw new Error(
      `Email "${email}" must be a valid email address. Expected format: user@example.com`,
    );
  }

  this.set("email", email);

  // Ensure the booking always references a real event document.
  // Note: This check is not atomic. For stronger guarantees, consider using
  // MongoDB transactions or database-level foreign key constraints.
  const eventExists = await Event.exists({ _id: this.eventId });

  if (!eventExists) {
    throw new Error(
      `Referenced event (ID: ${this.eventId}) does not exist. Create the event first.`,
    );
  }
});

export const Booking: BookingModel =
  models.Booking ?? model<IBooking, BookingModel>("Booking", bookingSchema);
