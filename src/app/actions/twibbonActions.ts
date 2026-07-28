"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createTwibbonSchema, updateTwibbonSchema } from "@/lib/schemas";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createTwibbon(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    layerUrl: formData.get("layerUrl"),
    thumbnailUrl: formData.get("thumbnailUrl"),
  };

  const validatedFields = createTwibbonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors[0].message);
  }

  const { title, slug, description, type, isActive, layerUrl, thumbnailUrl } = validatedFields.data;

  // Default config yang simpel
  const defaultConfig = {
    overlayType: type,
    chromaKey: type === "VIDEO" ? {
      color: [0.0, 1.0, 0.0],
      similarity: 0.1,
      smoothness: 0.08
    } : null,
    canvasSize: { width: 1080, height: 1080 }
  };

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
    }
  });

  revalidatePath("/admin/twibbons");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/twibbons");
  redirect("/admin/twibbons");
}

export async function updateTwibbon(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const rawData = {
    id: formData.get("id"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    layerUrl: formData.get("layerUrl") || undefined,
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
  };

  const validatedFields = updateTwibbonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors[0].message);
  }

  const { id, title, slug, description, type, isActive, layerUrl, thumbnailUrl } = validatedFields.data;

  const existingTwibbon = await prisma.twibbon.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existingTwibbon) {
    throw new Error("Twibbon tidak ditemukan");
  }

  // Update files ONLY if new files are provided
  let finalLayerUrl = layerUrl || existingTwibbon.overlayFile;
  let finalThumbnailUrl = thumbnailUrl || existingTwibbon.thumbnail;

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
    }
  });

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

  await prisma.twibbon.delete({
    where: { id: parseInt(id) }
  });

  revalidatePath("/admin/twibbons");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/twibbons");
}
