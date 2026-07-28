import { z } from "zod";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export const twibbonBaseSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(255, "Judul maksimal 255 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-zA-Z0-9-]+$/, "Slug hanya boleh berisi huruf, angka, dan strip (-)"),
  description: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"], { required_error: "Tipe harus IMAGE atau VIDEO" }),
  isActive: z.boolean().default(true),
  layerUrl: z.string().url("URL layer tidak valid").optional(),
  thumbnailUrl: z.string().url("URL thumbnail tidak valid").optional(),
});

export const createTwibbonSchema = twibbonBaseSchema.extend({
  layerUrl: z.string().url("URL layer wajib ada"),
  thumbnailUrl: z.string().url("URL thumbnail wajib ada"),
});

export const updateTwibbonSchema = z.object({
  id: z.string().min(1, "ID wajib ada"),
}).and(twibbonBaseSchema);
