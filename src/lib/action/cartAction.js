"use server";

import { prisma } from "../db.js";

const normalizeCartType = (type) => {
  if (!type) return "REGULAR";
  const normalized = String(type).trim().toLowerCase();
  return normalized === "bulk" ? "BULK" : "REGULAR";
};

const sanitizePayload = (payload) => {
  try {
    return JSON.parse(JSON.stringify(payload ?? {}));
  } catch (error) {
    return {};
  }
};

const toCartItem = (row) => {
  const payload = row?.payload && typeof row.payload === "object" ? row.payload : {};
  const createdAt = row?.createdAt instanceof Date ? row.createdAt.toISOString() : row?.createdAt;
  const updatedAt = row?.updatedAt instanceof Date ? row.updatedAt.toISOString() : row?.updatedAt;
  const baseItem = {
    ...payload,
    cartItemId: row.id,
    cartItemType: row.type,
    createdAt,
    updatedAt,
  };

  if (row.type === "BULK") {
    return {
      ...baseItem,
      isBulkOrder: true,
      id: row.id,
    };
  }

  return baseItem;
};

const splitCartRows = (rows = []) => {
  const items = [];
  const bulkItems = [];

  rows.forEach((row) => {
    if (!row) return;
    const item = toCartItem(row);
    if (row.type === "BULK") {
      bulkItems.push(item);
    } else {
      items.push(item);
    }
  });

  return { items, bulkItems };
};

export async function getCartByUserId(userId) {
  if (!userId) {
    return { success: false, message: "User ID is required." };
  }

  try {
    const rows = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: splitCartRows(rows),
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return {
      success: false,
      message: "Failed to fetch cart items.",
      error: error.message,
      status: 500,
    };
  }
}

export async function addCartItem({ userId, type, item }) {
  if (!userId) {
    return { success: false, message: "User ID is required." };
  }

  try {
    const payload = sanitizePayload(item);
    await prisma.cartItem.create({
      data: {
        userId,
        type: normalizeCartType(type),
        payload,
      },
    });

    const rows = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: splitCartRows(rows),
    };
  } catch (error) {
    console.error("Error adding cart item:", error);
    return {
      success: false,
      message: "Failed to add cart item.",
      error: error.message,
      status: 500,
    };
  }
}

export async function updateCartItem({ userId, cartItemId, item }) {
  if (!userId || !cartItemId) {
    return { success: false, message: "User ID and cart item ID are required." };
  }

  if (typeof cartItemId !== "string") {
    return { success: false, message: "Invalid cart item ID." };
  }

  try {
    const existing = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });

    if (!existing) {
      return { success: false, message: "Cart item not found." };
    }

    const payload = sanitizePayload(item);
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { payload },
    });

    const rows = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: splitCartRows(rows),
    };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return {
      success: false,
      message: "Failed to update cart item.",
      error: error.message,
      status: 500,
    };
  }
}

export async function removeCartItem({ userId, cartItemId }) {
  if (!userId || !cartItemId) {
    return { success: false, message: "User ID and cart item ID are required." };
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { id: cartItemId, userId },
    });

    const rows = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: splitCartRows(rows),
    };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return {
      success: false,
      message: "Failed to remove cart item.",
      error: error.message,
      status: 500,
    };
  }
}

export async function clearCartByUserId({ userId, type }) {
  if (!userId) {
    return { success: false, message: "User ID is required." };
  }

  try {
    const where = { userId };
    if (type) {
      where.type = normalizeCartType(type);
    }

    await prisma.cartItem.deleteMany({ where });

    const rows = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: splitCartRows(rows),
    };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return {
      success: false,
      message: "Failed to clear cart.",
      error: error.message,
      status: 500,
    };
  }
}
