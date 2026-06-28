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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
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

bookingSchema.pre("save", async function () {
  const email = this.email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    throw new Error("Email must be a valid email address.");
  }

  this.set("email", email);

  // Ensure the booking always references a real event document.
  const eventExists = await Event.exists({ _id: this.eventId });

  if (!eventExists) {
    throw new Error("Referenced event does not exist.");
  }
});

export const Booking: BookingModel =
  models.Booking ?? model<IBooking, BookingModel>("Booking", bookingSchema);
