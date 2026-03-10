import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";

function normalizeUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function getBrandClaimUrl(brand) {
  if (!brand) return null;
  const claimUrl =
    brand.website ||
    brand.domain ||
    (brand.slug ? `${brand.slug}.myshopify.com` : null);

  return normalizeUrl(claimUrl);
}

function resolveVoucherRedirect(voucherCode) {
  if (!voucherCode) return null;
  if (voucherCode.tokenizedLink) {
    if (!voucherCode.linkExpiresAt || voucherCode.linkExpiresAt > new Date()) {
      return normalizeUrl(voucherCode.tokenizedLink);
    }
  }

  return getBrandClaimUrl(voucherCode.voucher?.brand);
}

function normalizeCode(rawCode) {
  if (!rawCode) return "";
  try {
    return decodeURIComponent(rawCode).trim();
  } catch {
    return String(rawCode).trim();
  }
}

export default async function GiftRedeemPage({ params }) {
  const resolvedParams = await params;
  const code = normalizeCode(resolvedParams?.code);
  if (!code) {
    notFound();
  }

  const voucherCode = await prisma.voucherCode.findFirst({
    where: { code: { equals: code, mode: "insensitive" } },
    select: {
      tokenizedLink: true,
      linkExpiresAt: true,
      voucher: {
        select: {
          brand: { select: { website: true, domain: true, slug: true } },
        },
      },
    },
  });

  const voucherRedirect = resolveVoucherRedirect(voucherCode);
  if (voucherRedirect) {
    redirect(voucherRedirect);
  }

  const giftCard = await prisma.giftCard.findFirst({
    where: { code: { equals: code, mode: "insensitive" } },
    select: {
      shop: true,
      voucherCode: {
        select: {
          tokenizedLink: true,
          linkExpiresAt: true,
          voucher: {
            select: {
              brand: { select: { website: true, domain: true, slug: true } },
            },
          },
        },
      },
    },
  });

  const giftCardRedirect =
    resolveVoucherRedirect(giftCard?.voucherCode) ||
    normalizeUrl(giftCard?.shop);

  if (giftCardRedirect) {
    redirect(giftCardRedirect);
  }

  notFound();
}
