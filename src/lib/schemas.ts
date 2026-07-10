import { z } from "zod";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

const fileSchema = z.custom<File>((val) => val instanceof File, "Harus berupa file");

export const twibbonBaseSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(255, "Judul maksimal 255 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-zA-Z0-9-]+$/, "Slug hanya boleh berisi huruf, angka, dan strip (-)"),
  description: z.string().optional(),
  type: z.enum(["IMAGE", "VIDEO"], { required_error: "Tipe harus IMAGE atau VIDEO" }),
  isActive: z.boolean().default(true),
  layerFile: fileSchema.optional(),
  thumbnailFile: fileSchema.optional(),
}).superRefine((data, ctx) => {
  const maxLayerSize = data.type === "VIDEO" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  const acceptedTypes = data.type === "VIDEO" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES;

  if (data.layerFile && data.layerFile.size > 0) {
    if (data.layerFile.size > maxLayerSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Ukuran file maksimal ${data.type === "VIDEO" ? "50MB" : "10MB"}`,
        path: ["layerFile"],
      });
    }
    if (!acceptedTypes.includes(data.layerFile.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Format file tidak valid untuk tipe ${data.type}`,
        path: ["layerFile"],
      });
    }
  }

  if (data.thumbnailFile && data.thumbnailFile.size > 0) {
    if (data.thumbnailFile.size > MAX_IMAGE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ukuran thumbnail maksimal 10MB",
        path: ["thumbnailFile"],
      });
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(data.thumbnailFile.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format thumbnail harus berupa gambar (JPG/PNG/WEBP)",
        path: ["thumbnailFile"],
      });
    }
  }
});

export const createTwibbonSchema = twibbonBaseSchema.superRefine((data, ctx) => {
  if (!data.layerFile || data.layerFile.size === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "File twibbon wajib diupload", path: ["layerFile"] });
  }
  if (!data.thumbnailFile || data.thumbnailFile.size === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thumbnail wajib diupload", path: ["thumbnailFile"] });
  }
});

export const updateTwibbonSchema = z.object({
  id: z.string().min(1, "ID wajib ada"),
}).and(twibbonBaseSchema);
