import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
} from "mongoose";

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

type EventModel = Model<IEvent>;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_12H_REGEX = /^(\d{1,2}):(\d{2})\s*(AM|PM)/i;

const REQUIRED_STRING_FIELDS = [
  "title",
  "description",
  "overview",
  "image",
  "venue",
  "location",
  "mode",
  "audience",
  "organizer",
] as const satisfies ReadonlyArray<keyof IEvent>;

/** Convert a title into a URL-safe slug. */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Normalize a date string to ISO format (YYYY-MM-DD). */
function normalizeDate(date: string): string {
  const trimmed = date.trim();

  if (ISO_DATE_REGEX.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Date must be a valid ISO date (YYYY-MM-DD).");
    }

    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Date must be a valid, parseable value.");
  }

  return parsed.toISOString().slice(0, 10);
}

/** Normalize time strings to 24-hour HH:MM format. */
function normalizeTime(time: string): string {
  const trimmed = time.trim();

  if (TIME_24H_REGEX.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(TIME_12H_REGEX);
  if (!match) {
    throw new Error("Time must be in HH:MM or h:mm AM/PM format.");
  }

  let hours = Number.parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

const eventSchema = new Schema<IEvent, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  { timestamps: true },
);

// Enforce fast lookups and uniqueness for event URLs.
eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre("save", function () {
  for (const field of REQUIRED_STRING_FIELDS) {
    const value = this.get(field);

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`${field} is required and cannot be empty.`);
    }

    this.set(field, value.trim());
  }

  for (const field of ["agenda", "tags"] as const) {
    const value = this.get(field);

    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      value.some((item) => typeof item !== "string" || item.trim().length === 0)
    ) {
      throw new Error(`${field} must contain at least one non-empty value.`);
    }

    this.set(
      field,
      value.map((item) => item.trim()),
    );
  }

  // Regenerate slug only when the title changes to keep existing URLs stable.
  if (this.isModified("title")) {
    this.set("slug", generateSlug(this.title));
  }

  if (this.isModified("date")) {
    this.set("date", normalizeDate(this.date));
  }

  if (this.isModified("time")) {
    this.set("time", normalizeTime(this.time));
  }
});

export const Event: EventModel =
  models.Event ?? model<IEvent, EventModel>("Event", eventSchema);
