import { prisma } from "./db.js";

export const SHOP_INSTALLATION_APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
};

// Temporary bypass: let Shopify merchants access the dashboard immediately.
const SKIP_SHOPIFY_INSTALLATION_APPROVAL = true;

function getAutoApprovalData() {
  if (!SKIP_SHOPIFY_INSTALLATION_APPROVAL) {
    return {
      approvalStatus: SHOP_INSTALLATION_APPROVAL_STATUS.PENDING,
      approvedAt: null,
    };
  }

  return {
    approvalStatus: SHOP_INSTALLATION_APPROVAL_STATUS.APPROVED,
    approvedAt: new Date(),
  };
}

export function normalizeShopDomain(shop) {
  if (!shop) {
    return "";
  }

  const cleaned = String(shop)
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/\.myshopify\.com$/i, "");

  if (!/^[a-z0-9][a-z0-9-]*$/i.test(cleaned)) {
    return "";
  }

  return `${cleaned}.myshopify.com`.toLowerCase();
}

export async function upsertShopInstallation(session) {
  const shop = normalizeShopDomain(session?.shop);

  if (!shop || !session?.accessToken) {
    return null;
  }

  return prisma.appInstallation.upsert({
    where: { shop },
    update: {
      accessToken: session.accessToken,
      scopes: session.scope || "",
      isActive: true,
      ...(SKIP_SHOPIFY_INSTALLATION_APPROVAL
        ? {
            approvalStatus: SHOP_INSTALLATION_APPROVAL_STATUS.APPROVED,
            approvedAt: new Date(),
          }
        : {}),
    },
    create: {
      shop,
      accessToken: session.accessToken,
      scopes: session.scope || "",
      isActive: true,
      ...getAutoApprovalData(),
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
    (SKIP_SHOPIFY_INSTALLATION_APPROVAL ||
      installation?.approvalStatus === SHOP_INSTALLATION_APPROVAL_STATUS.APPROVED);
  const approvalStatus = approved
    ? SHOP_INSTALLATION_APPROVAL_STATUS.APPROVED
    : installation?.approvalStatus ?? null;

  return {
    shop: shopDomain,
    found,
    isActive,
    approved,
    requiresInstall: !found || !isActive,
    requiresApproval: found && isActive && !approved,
    approvalStatus,
    installedAt: installation?.installedAt ?? null,
    approvedAt: approved ? installation?.approvedAt ?? new Date() : null,
    brand,
  };
}

export async function isShopApproved(shop) {
  const access = await getShopInstallationAccess(shop);
  return access.approved;
}
