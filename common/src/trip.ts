import * as v from "valibot";
import { FieldMetadata } from "./common.ts";

export const TripCreateSchema = v.object({
  name: v.pipe(v.string(), v.minLength(2), v.title("Name"), v.metadata(FieldMetadata({ icon: "✈" }))),
  location: v.pipe(v.string(), v.minLength(2), v.title("Location"), v.metadata(FieldMetadata({ icon: "🌍" }))),
});

export type TripCreate = v.InferInput<typeof TripCreateSchema>;

export const TripUpdateSchema = v.partial(TripCreateSchema);

export type TripUpdate = v.InferInput<typeof TripUpdateSchema>;

export const TripAddUserSchema = v.object({
  trip_id: v.pipe(v.string(), v.uuid(), v.title("Trip ID")),
  user_id: v.pipe(v.string(), v.uuid(), v.title("User ID")),
});
