import React from "react";

function normalizeCode(rawCode) {
  if (!rawCode) return "";
  try {
    return decodeURIComponent(rawCode).trim();
  } catch {
    return String(rawCode).trim();
  }
}

export default async function GiftVoucherImageView({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const code = normalizeCode(resolvedParams?.code);
  const imageSrc = code ? `/gift-voucher/${encodeURIComponent(code)}/image` : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Gift voucher"
          style={{
            width: "100%",
            height: "auto",
            maxWidth: "100%",
            maxHeight: "100vh",
            objectFit: "contain",
            display: "block",
          }}
        />
      ) : (
        <span
          style={{
            color: "#94a3b8",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          Voucher code missing
        </span>
      )}
    </div>
  );
}
