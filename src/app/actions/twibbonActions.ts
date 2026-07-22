"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createTwibbonSchema, updateTwibbonSchema } from "@/lib/schemas";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Fungsi helper untuk menyimpan file secara lokal
async function saveFile(file: File, folder: string): Promise<string> {
  const uploadApiUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL;
  const uploadSecret = process.env.UPLOAD_SECRET;

  if (!uploadApiUrl || !uploadSecret) {
    throw new Error("Sistem gagal: URL API atau Secret untuk upload belum diatur di Environment Variables!");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("secret", uploadSecret);

  try {
    const response = await fetch(uploadApiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      return data.url; // Mengembalikan URL file dari asset.bem-unsoed.com
    } else {
      throw new Error(data.error || "Upload failed on the asset server");
    }
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Gagal mengunggah file ke server aset Hostinger.");
  }
}

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
    isActive: formData.get("isActive") === "on",
    layerFile: formData.get("layerFile"),
    thumbnailFile: formData.get("thumbnailFile"),
  };

  const validatedFields = createTwibbonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors[0].message);
  }

  const { title, slug, description, type, isActive, layerFile, thumbnailFile } = validatedFields.data;

  // Simpan file
  const layerUrl = await saveFile(layerFile as File, type === "VIDEO" ? "videos" : "images");
  const thumbnailUrl = await saveFile(thumbnailFile as File, "thumbnails");

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
    isActive: formData.get("isActive") === "on",
    layerFile: formData.get("layerFile"),
    thumbnailFile: formData.get("thumbnailFile"),
  };

  const validatedFields = updateTwibbonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors[0].message);
  }

  const { id, title, slug, description, type, isActive, layerFile, thumbnailFile } = validatedFields.data;

  const existingTwibbon = await prisma.twibbon.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existingTwibbon) {
    throw new Error("Twibbon tidak ditemukan");
  }

  // Update files ONLY if new files are provided
  let layerUrl = existingTwibbon.overlayFile;
  let thumbnailUrl = existingTwibbon.thumbnail;

  if (layerFile && layerFile.size > 0) {
    layerUrl = await saveFile(layerFile as File, type === "VIDEO" ? "videos" : "images");
  }
  
  if (thumbnailFile && thumbnailFile.size > 0) {
    thumbnailUrl = await saveFile(thumbnailFile as File, "thumbnails");
  }

  await prisma.twibbon.update({
    where: { id: parseInt(id) },
    data: {
      title,
      slug,
      description,
      type,
      overlayFile: layerUrl,
      thumbnail: thumbnailUrl,
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
