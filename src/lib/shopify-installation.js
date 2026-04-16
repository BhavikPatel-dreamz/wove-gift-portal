import { prisma } from "./db.js";

export const SHOP_INSTALLATION_APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
};

export function normalizeShopDomain(shop) {
  if (!shop) {
    return "";
  }

  const cleaned = shop
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .replace(/\.myshopify\.com$/i, "");

  if (!cleaned) {
    return "";
  }

  return `${cleaned}.myshopify.com`.toLowerCase();
}

export async function upsertShopInstallation(session) {
  if (!session?.shop || !session?.accessToken) {
    return null;
  }

  return prisma.appInstallation.upsert({
    where: { shop: normalizeShopDomain(session.shop) },
    update: {
      accessToken: session.accessToken,
      scopes: session.scope || "",
      isActive: true,
    },
    create: {
      shop: normalizeShopDomain(session.shop),
      accessToken: session.accessToken,
      scopes: session.scope || "",
      isActive: true,
      approvalStatus: SHOP_INSTALLATION_APPROVAL_STATUS.PENDING,
    },
    select: {
      id: true,
      shop: true,
      isActive: true,
      approvalStatus: true,
      installedAt: true,
      approvedAt: true,
    },
  });
}

export async function getShopInstallationAccess(shop) {
  const shopDomain = normalizeShopDomain(shop);

  if (!shopDomain) {
    return {
      shop: "",
      found: false,
      isActive: false,
      approved: false,
      requiresInstall: true,
      requiresApproval: false,
      approvalStatus: null,
      installedAt: null,
      approvedAt: null,
      brand: null,
    };
  }

  const [installation, brand] = await Promise.all([
    prisma.appInstallation.findUnique({
      where: { shop: shopDomain },
      select: {
        id: true,
        shop: true,
        isActive: true,
        approvalStatus: true,
        installedAt: true,
        approvedAt: true,
      },
    }),
    prisma.brand.findFirst({
      where: {
        OR: [
          { domain: shopDomain },
          {
            website: {
              in: [shopDomain, `https://${shopDomain}`, `http://${shopDomain}`],
            },
          },
        ],
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
    }),
  ]);

  const found = Boolean(installation);
  const isActive = Boolean(installation?.isActive);
  const approved =
    isActive &&
    installation?.approvalStatus === SHOP_INSTALLATION_APPROVAL_STATUS.APPROVED;

  return {
    shop: shopDomain,
    found,
    isActive,
    approved,
    requiresInstall: !found || !isActive,
    requiresApproval: found && isActive && !approved,
    approvalStatus: installation?.approvalStatus ?? null,
    installedAt: installation?.installedAt ?? null,
    approvedAt: installation?.approvedAt ?? null,
    brand,
  };
}

export async function isShopApproved(shop) {
  const access = await getShopInstallationAccess(shop);
  return access.approved;
}
