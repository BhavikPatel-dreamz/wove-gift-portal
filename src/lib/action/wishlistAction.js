"use server";

import { prisma } from "../db.js";

const sanitizePayload = (payload) => {
  try {
    return JSON.parse(JSON.stringify(payload ?? {}));
  } catch (error) {
    return {};
  }
};

const getWishlistFieldSet = () => {
  try {
    const models = prisma?._dmmf?.datamodel?.models || [];
    const wishlistModel = models.find((model) => model.name === "Wishlist");
    const fieldNames = wishlistModel?.fields?.map((field) => field.name) || [];
    return new Set(fieldNames);
  } catch (error) {
    return new Set();
  }
};

const supportsWishlistField = (fieldName) => {
  const fieldSet = getWishlistFieldSet();
  return fieldSet.has(fieldName);
};

const normalizeKey = (key) => String(key || "").trim();
const normalizeText = (value) => String(value || "").trim();
const isBlank = (value) => normalizeText(value).length === 0;
const isPlaceholderBrandName = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  return normalized.length === 0 || normalized === "gift card";
};

const toWishlistItem = (row) => {
  const payload = row?.payload && typeof row.payload === "object" ? row.payload : {};
  const derivedKey =
    row?.key ||
    payload?.key ||
    (row?.voucherId ? `voucher:${row.voucherId}` : row?.brandId ? `brand:${row.brandId}` : row?.id);
  const createdAt = row?.createdAt instanceof Date ? row.createdAt.toISOString() : row?.createdAt;
  const updatedAt = row?.updatedAt instanceof Date ? row.updatedAt.toISOString() : row?.updatedAt;

  return {
    ...payload,
    key: derivedKey,
    sourceType: payload.sourceType || row.sourceType || "brand",
    brandId: payload.brandId || row.brandId || null,
    voucherId: payload.voucherId || row.voucherId || null,
    createdAt,
    updatedAt,
  };
};

const enrichWishlistItems = async (rows = []) => {
  const baseItems = rows.map(toWishlistItem);
  if (!rows.length) {
    return baseItems;
  }

  try {
    const brandIdCandidates = new Set();
    const voucherIdCandidates = new Set();

    baseItems.forEach((item, index) => {
      const row = rows[index];
      const brandId = item?.brandId || row?.brandId;
      const voucherId = item?.voucherId || row?.voucherId;

      if (!isBlank(brandId)) {
        brandIdCandidates.add(String(brandId));
      }
      if (!isBlank(voucherId)) {
        voucherIdCandidates.add(String(voucherId));
      }
    });

    const brandIds = Array.from(brandIdCandidates);
    const voucherIds = Array.from(voucherIdCandidates);

    const [brands, vouchers] = await Promise.all([
      brandIds.length
        ? prisma.brand.findMany({
            where: {
              OR: [
                { id: { in: brandIds } },
                { brandName: { in: brandIds } },
              ],
            },
            select: {
              id: true,
              brandName: true,
              logo: true,
            },
          })
        : Promise.resolve([]),
      voucherIds.length
        ? prisma.vouchers.findMany({
            where: { id: { in: voucherIds } },
            select: {
              id: true,
              brand: {
                select: {
                  id: true,
                  brandName: true,
                  logo: true,
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const brandById = new Map();
    const brandByName = new Map();

    brands.forEach((brand) => {
      if (!brand) return;
      if (!isBlank(brand.id)) {
        brandById.set(String(brand.id), brand);
      }
      if (!isBlank(brand.brandName)) {
        brandByName.set(String(brand.brandName).toLowerCase(), brand);
      }
    });

    const voucherBrandById = new Map();
    vouchers.forEach((voucher) => {
      if (!voucher?.id || !voucher?.brand) return;
      voucherBrandById.set(String(voucher.id), voucher.brand);
    });

    return baseItems.map((item, index) => {
      const row = rows[index];
      const nextItem = { ...item };

      const resolvedBrand =
        item?.brand ||
        item?.selectedBrand ||
        item?.voucher?.brand ||
        voucherBrandById.get(String(item?.voucherId || row?.voucherId || "")) ||
        brandById.get(String(item?.brandId || row?.brandId || "")) ||
        brandByName.get(String(item?.brandId || row?.brandId || "").toLowerCase()) ||
        brandByName.get(String(item?.brandName || "").toLowerCase()) ||
        null;

      if (resolvedBrand) {
        const resolvedName = resolvedBrand.brandName || resolvedBrand.name;
        if (resolvedName && isPlaceholderBrandName(nextItem.brandName)) {
          nextItem.brandName = resolvedName;
        }
        if (resolvedBrand.logo) {
          nextItem.logo = resolvedBrand.logo;
        }
        if (!nextItem.brandId && resolvedBrand.id) {
          nextItem.brandId = resolvedBrand.id;
        }
      }

      return nextItem;
    });
  } catch (error) {
    console.error("Error enriching wishlist items:", error);
    return baseItems;
  }
};

export async function getWishlistByUserId(userId) {
  if (!userId) {
    return { success: false, message: "User ID is required." };
  }

  try {
    const rows = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: await enrichWishlistItems(rows),
    };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return {
      success: false,
      message: "Failed to fetch wishlist.",
      error: error.message,
      status: 500,
    };
  }
}

export async function toggleWishlistItem({ userId, item }) {
  if (!userId) {
    return { success: false, message: "User ID is required." };
  }

  const payload = sanitizePayload(item);
  const key = normalizeKey(payload.key || item?.key);

  if (!key) {
    return { success: false, message: "Wishlist key is required." };
  }

  try {
    const hasKeyField = supportsWishlistField("key");
    const hasPayloadField = supportsWishlistField("payload");
    const hasSourceTypeField = supportsWishlistField("sourceType");

    if (hasKeyField) {
      const existing = await prisma.wishlist.findFirst({
        where: { userId, key },
      });

      if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
      } else {
        await prisma.wishlist.create({
          data: {
            userId,
            key,
            sourceType: hasSourceTypeField ? (payload.sourceType || null) : undefined,
            brandId: payload.brandId || null,
            voucherId: payload.voucherId || null,
            payload: hasPayloadField ? payload : undefined,
          },
        });
      }
    } else {
      const brandId = payload.brandId || null;
      const voucherId = payload.voucherId || null;
      const existing = await prisma.wishlist.findFirst({
        where: { userId, brandId, voucherId },
      });

      if (existing) {
        await prisma.wishlist.deleteMany({ where: { userId, brandId, voucherId } });
      } else {
        await prisma.wishlist.create({
          data: {
            userId,
            brandId,
            voucherId,
          },
        });
      }
    }

    const rows = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: await enrichWishlistItems(rows),
    };
  } catch (error) {
    console.error("Error toggling wishlist item:", error);
    return {
      success: false,
      message: "Failed to update wishlist.",
      error: error.message,
      status: 500,
    };
  }
}

export async function removeWishlistItem({ userId, key }) {
  if (!userId || !key) {
    return { success: false, message: "User ID and key are required." };
  }

  try {
    const hasKeyField = supportsWishlistField("key");
    if (hasKeyField) {
      await prisma.wishlist.deleteMany({
        where: { userId, key },
      });
    } else {
      const brandId = key.startsWith("brand:") ? key.replace(/^brand:/, "") : null;
      const voucherId = key.startsWith("voucher:") ? key.replace(/^voucher:/, "") : null;
      await prisma.wishlist.deleteMany({
        where: {
          userId,
          ...(brandId ? { brandId } : {}),
          ...(voucherId ? { voucherId } : {}),
        },
      });
    }

    const rows = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: await enrichWishlistItems(rows),
    };
  } catch (error) {
    console.error("Error removing wishlist item:", error);
    return {
      success: false,
      message: "Failed to remove wishlist item.",
      error: error.message,
      status: 500,
    };
  }
}

export async function clearWishlistByUserId(userId) {
  if (!userId) {
    return { success: false, message: "User ID is required." };
  }

  try {
    await prisma.wishlist.deleteMany({ where: { userId } });
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return {
      success: false,
      message: "Failed to clear wishlist.",
      error: error.message,
      status: 500,
    };
  }
}
