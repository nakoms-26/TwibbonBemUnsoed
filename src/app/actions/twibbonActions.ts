"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createTwibbonSchema, updateTwibbonSchema } from "@/lib/schemas";
import { redirect, unstable_rethrow } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ActionResult = { error: string } | { success: true };

export async function createTwibbon(formData: FormData): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: "Unauthorized: Sesi login tidak ditemukan." };
  }

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    chromaColor: formData.get("chromaColor") || undefined,
    isActive:
      formData.get("isActive") === "on" || formData.get("isActive") === "true",
    layerUrl: formData.get("layerUrl"),
    thumbnailUrl: formData.get("thumbnailUrl"),
  };

  const validatedFields = createTwibbonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const {
    title,
    slug,
    description,
    type,
    isActive,
    chromaColor,
    layerUrl,
    thumbnailUrl,
  } = validatedFields.data;

  // Default config yang simpel
  const defaultConfig = {
    overlayType: type,
    chromaKey:
      type === "VIDEO"
        ? {
            color: chromaColor || "#00FF00",
            similarity: 0.1,
            smoothness: 0.08,
          }
        : null,
    canvasSize: { width: 1080, height: 1080 },
  };

  try {
    await prisma.twibbon.create({
      data: {
        title,
        slug,
        description,
        type,
        overlayFile: layerUrl,
        thumbnail: thumbnailUrl,
        isActive,
        config: defaultConfig,
      },
    });
  } catch (error: any) {
    unstable_rethrow(error);
    if (error.code === "P2002") {
      return {
        error: "Gagal menyimpan: Slug (URL) sudah dipakai, mohon ganti dengan nama lain.",
      };
    }
    if (
      error.code === "P1001" ||
      error.code === "P1002" ||
      error.code === "P1008" ||
      error.code === "P1009" ||
      error.code === "P1010"
    ) {
      return { error: "Gagal terhubung ke database. Silakan coba beberapa saat lagi." };
    }
    console.error("[createTwibbon] Prisma error:", error);
    return { error: "Gagal menyimpan data: " + (error.message || "Terjadi kesalahan tidak diketahui") };
  }

  revalidatePath("/admin/twibbons");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/twibbons");
  redirect("/admin/twibbons");
}

export async function updateTwibbon(formData: FormData): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: "Unauthorized: Sesi login tidak ditemukan." };
  }

  const rawData = {
    id: formData.get("id"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    chromaColor: formData.get("chromaColor") || undefined,
    isActive:
      formData.get("isActive") === "on" || formData.get("isActive") === "true",
    layerUrl: formData.get("layerUrl") || undefined,
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
  };

  const validatedFields = updateTwibbonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const {
    id,
    title,
    slug,
    description,
    type,
    isActive,
    chromaColor,
    layerUrl,
    thumbnailUrl,
  } = validatedFields.data;

  let existingTwibbon;
  try {
    existingTwibbon = await prisma.twibbon.findUnique({
      where: { id: parseInt(id) },
    });
  } catch (error: any) {
    unstable_rethrow(error);
    console.error("[updateTwibbon] findUnique error:", error);
    return { error: "Gagal terhubung ke database. Silakan coba beberapa saat lagi." };
  }

  if (!existingTwibbon) {
    return { error: "Twibbon tidak ditemukan." };
  }

  // Update files ONLY if new files are provided
  const finalLayerUrl = layerUrl || existingTwibbon.overlayFile;
  const finalThumbnailUrl = thumbnailUrl || existingTwibbon.thumbnail;

  // Perbarui config chromaKey jika tipenya VIDEO
  let finalConfig = existingTwibbon.config as any;
  if (type === "VIDEO") {
    finalConfig = {
      ...finalConfig,
      overlayType: type,
      chromaKey: {
        color: chromaColor || "#00FF00",
        similarity: 0.1,
        smoothness: 0.08,
      },
    };
  } else {
    finalConfig = {
      ...finalConfig,
      overlayType: type,
      chromaKey: null,
    };
  }

  try {
    await prisma.twibbon.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug,
        description,
        type,
        overlayFile: finalLayerUrl,
        thumbnail: finalThumbnailUrl,
        isActive,
        config: finalConfig,
      },
    });
  } catch (error: any) {
    unstable_rethrow(error);
    if (error.code === "P2002") {
      return {
        error: "Gagal menyimpan: Slug (URL) sudah dipakai, mohon ganti dengan nama lain.",
      };
    }
    if (
      error.code === "P1001" ||
      error.code === "P1002" ||
      error.code === "P1008" ||
      error.code === "P1009" ||
      error.code === "P1010"
    ) {
      return { error: "Gagal terhubung ke database. Silakan coba beberapa saat lagi." };
    }
    console.error("[updateTwibbon] Prisma error:", error);
    return { error: "Gagal menyimpan data: " + (error.message || "Terjadi kesalahan tidak diketahui") };
  }

  revalidatePath("/admin/twibbons");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/${slug}`);
  revalidatePath("/");
  revalidatePath("/twibbons");
  redirect("/admin/twibbons");
}

export async function deleteTwibbon(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.twibbon.delete({
      where: { id: parseInt(id) },
    });
  } catch (error: any) {
    unstable_rethrow(error);
    console.error("[deleteTwibbon] error:", error);
    throw new Error("Gagal menghapus twibbon.");
  }

  revalidatePath("/admin/twibbons");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/twibbons");
}
