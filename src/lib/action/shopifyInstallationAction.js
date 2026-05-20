"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import {
  normalizeShopDomain,
  SHOP_INSTALLATION_APPROVAL_STATUS,
} from "../shopify-installation";
import { validateSession } from "./userAction/session";
import { isAdminRole } from "../roles";

async function requireAdminSession() {
  const session = await validateSession();

  if (!session?.user || !isAdminRole(session.user.role)) {
    throw new Error("Unauthorized");
  }

  return session;
}

function mapInstallationWithBrand(installation, brandMap) {
  const brand = brandMap.get(installation.shop) ?? null;

  return {
    id: installation.id,
    shop: installation.shop,
    installedAt: installation.installedAt,
    approvedAt: installation.approvedAt,
    approvalStatus: installation.approvalStatus,
    isActive: installation.isActive,
    brand: brand
      ? {
          id: brand.id,
          brandName: brand.brandName,
          contact: brand.contact,
          website: brand.website,
          domain: brand.domain,
          currency: brand.currency,
          isActive: brand.isActive,
        }
      : null,
  };
}

export async function getShopInstallationReviewData() {
  await requireAdminSession();

  const installations = await prisma.appInstallation.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      shop: true,
      installedAt: true,
      approvedAt: true,
      approvalStatus: true,
      isActive: true,
    },
    orderBy: [{ installedAt: "desc" }],
  });

  const shops = installations.map((installation) => installation.shop);

  const brands = shops.length
    ? await prisma.brand.findMany({
        where: {
          domain: {
            in: shops,
          },
        },
        select: {
          id: true,
          brandName: true,
          contact: true,
          website: true,
          domain: true,
          currency: true,
          isActive: true,
        },
      })
    : [];

  const brandMap = new Map(
    brands.map((brand) => [normalizeShopDomain(brand.domain), brand]),
  );

  const pending = [];
  const approved = [];

  installations.forEach((installation) => {
    const mapped = mapInstallationWithBrand(installation, brandMap);

    if (
      installation.approvalStatus ===
      SHOP_INSTALLATION_APPROVAL_STATUS.APPROVED
    ) {
      approved.push(mapped);
      return;
    }

    pending.push(mapped);
  });

  return {
    pending,
    approved,
    counts: {
      pending: pending.length,
      approved: approved.length,
      totalActive: installations.length,
    },
  };
}

export async function approveShopInstallationAction(formData) {
  await requireAdminSession();

  const shop = normalizeShopDomain(formData.get("shop"));

  if (!shop) {
    throw new Error("Shop domain is required");
  }

  await prisma.appInstallation.update({
    where: { shop },
    data: {
      approvalStatus: SHOP_INSTALLATION_APPROVAL_STATUS.APPROVED,
      approvedAt: new Date(),
      isActive: true,
    },
  });

  revalidatePath("/brandsPartner");
}
