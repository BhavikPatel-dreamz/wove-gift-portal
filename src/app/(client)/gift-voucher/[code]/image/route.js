import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function normalizeCode(rawCode) {
  if (!rawCode) return "";
  try {
    return decodeURIComponent(rawCode).trim();
  } catch {
    return String(rawCode).trim();
  }
}

function resolveAbsoluteImageUrl(rawUrl, requestUrl) {
  if (!rawUrl) return null;
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return new URL(trimmed, requestUrl).toString();
  }

  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return new URL(`/${trimmed}`, requestUrl).toString();
}

async function findOrderByCode(code) {
  const voucherCode = await prisma.voucherCode.findFirst({
    where: { code: { equals: code, mode: "insensitive" } },
    select: {
      order: {
        select: {
          isCustom: true,
          customImageUrl: true,
          customCardId: true,
          subCategoryId: true,
          occasion: { select: { image: true } },
        },
      },
    },
  });

  if (voucherCode?.order) {
    return voucherCode.order;
  }

  const giftCard = await prisma.giftCard.findFirst({
    where: { code: { equals: code, mode: "insensitive" } },
    select: {
      voucherCode: {
        select: {
          order: {
            select: {
              isCustom: true,
              customImageUrl: true,
              customCardId: true,
              subCategoryId: true,
              occasion: { select: { image: true } },
            },
          },
        },
      },
    },
  });

  return giftCard?.voucherCode?.order || null;
}

async function resolveOrderImage(order) {
  const customImageUrl = order?.customImageUrl?.trim();
  if (customImageUrl) return customImageUrl;

  if (order?.isCustom && order?.customCardId) {
    const customCard = await prisma.customCard.findUnique({
      where: { id: order.customCardId },
      select: { image: true },
    });

    if (customCard?.image) return customCard.image;
  }

  if (!order?.isCustom && order?.subCategoryId) {
    const category = await prisma.occasionCategory.findUnique({
      where: { id: order.subCategoryId },
      select: { image: true },
    });

    if (category?.image) return category.image;
  }

  return order?.occasion?.image || null;
}

export async function GET(request, { params }) {
  const resolvedParams = await Promise.resolve(params);
  const code = normalizeCode(resolvedParams?.code);
  if (!code) {
    return NextResponse.json(
      { error: "Voucher code is required" },
      { status: 404 },
    );
  }

  const order = await findOrderByCode(code);
  if (!order) {
    return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
  }

  const imagePath = await resolveOrderImage(order);
  if (!imagePath) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const imageUrl = resolveAbsoluteImageUrl(imagePath, request.url);
  if (!imageUrl) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 404 });
  }

  const imageResponse = await fetch(imageUrl, {
    cache: "force-cache",
    next: { revalidate: 3600 },
  });

  if (!imageResponse.ok || !imageResponse.body) {
    return NextResponse.json({ error: "Image fetch failed" }, { status: 404 });
  }

  const headers = new Headers();
  const contentType = imageResponse.headers.get("content-type");
  const contentLength = imageResponse.headers.get("content-length");
  if (contentType) headers.set("content-type", contentType);
  if (contentLength) headers.set("content-length", contentLength);
  headers.set(
    "cache-control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );

  return new NextResponse(imageResponse.body, {
    status: 200,
    headers,
  });
}
