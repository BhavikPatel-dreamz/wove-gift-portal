import Image from "next/image";
import { currencyList } from "../../brandsPartner/currency";

const labelStyle = {
  margin: "0 0 2px",
  fontSize: 9,
  fontWeight: 700,
  color: "#AAAAAA",
  textTransform: "uppercase",
  letterSpacing: 1,
};

const valueStyle = {
  margin: "0 0 10px",
  fontSize: 12,
  fontWeight: 600,
  color: "#111111",
  wordBreak: "break-all",
};

const EditIcon = ({ onClick, id }) => (
  <button
    onClick={onClick}
    aria-label="Edit"
    style={{
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 10,
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
    }}
  >
    <svg width="26" height="26" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.469" y="0.469" width="29.062" height="29.062" rx="14.531" fill="white" />
      <rect x="0.469" y="0.469" width="29.062" height="29.062" rx="14.531"
        stroke={`url(#eg-${id})`} strokeWidth="0.9375" />
      <path
        d="M9.375 18.4125V20.3125C9.375 20.4875 9.5125 20.625 9.6875 20.625H11.5875C11.6688 20.625 11.75 20.5938 11.8062 20.5313L18.6312 13.7125L16.2875 11.3688L9.46875 18.1875C9.40625 18.25 9.375 18.325 9.375 18.4125ZM20.4437 11.9C20.5017 11.8422 20.5477 11.7735 20.579 11.6979C20.6104 11.6223 20.6265 11.5412 20.6265 11.4594C20.6265 11.3775 20.6104 11.2965 20.579 11.2209C20.5477 11.1453 20.5017 11.0766 20.4437 11.0188L18.9813 9.55625C18.9234 9.49831 18.8547 9.45234 18.7791 9.42098C18.7035 9.38962 18.6225 9.37347 18.5406 9.37347C18.4588 9.37347 18.3777 9.38962 18.3021 9.42098C18.2265 9.45234 18.1578 9.49831 18.1 9.55625L16.9563 10.7L19.3 13.0438L20.4437 11.9Z"
        fill={`url(#ef-${id})`}
      />
      <defs>
        <linearGradient id={`eg-${id}`} x1="0" y1="11.038" x2="28.556" y2="23.787" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ED457D" /><stop offset="1" stopColor="#FA8F42" />
        </linearGradient>
        <linearGradient id={`ef-${id}`} x1="9.375" y1="13.513" x2="20.085" y2="18.295" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ED457D" /><stop offset="1" stopColor="#FA8F42" />
        </linearGradient>
      </defs>
    </svg>
  </button>
);

export default function GiftCardPreview({
  formData = {},
  personalMessage = "",
  selectedSubCategory = null,
  selectedAmount = { currency: "ZAR", value: 50 },
  selectedBrand = null,
  goToMessageStep = () => {},
  goToOccationCategoryStep = () => {},
  goToAmountStep = () => {},
}) {
  const getCurrencySymbol = (code) =>
    currencyList?.find((c) => c.code === code)?.symbol ?? (code ? `${code} ` : "$");

  const brandName =
    selectedBrand?.name || selectedSubCategory?.brandName || "Brand";

  return (
    /* No outer shell — renders flush inside EmailForm's white card */
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", width: "100%" }}>

      {/* ── GRADIENT HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #F25C8A 0%, #F2845C 100%)",
        padding: "24px 28px",
        textAlign: "center",
      }}>
        <p style={{ margin: "0 0 6px", fontSize: 24, lineHeight: 1 }}>🎁</p>
        <h1 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.2px",
          lineHeight: 1.3,
        }}>
          You've received a Gift Card!
        </h1>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "24px 24px 20px", backgroundColor: "#ffffff" }}>

        {/* Greeting */}
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#111111" }}>
          Hi {formData.recipientFullName || "there"},
        </p>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#555555", lineHeight: 1.7 }}>
          <strong style={{ color: "#111111", fontWeight: 600 }}>
            {formData.yourFullName || "Someone special"}
          </strong>{" "}
          has sent you a{" "}
          <strong style={{ color: "#111111", fontWeight: 600 }}>{brandName}</strong>{" "}
          gift card to celebrate a special occasion.
        </p>

        {/* Personal Message */}
        {personalMessage && (
          <div style={{
            position: "relative",
            backgroundColor: "#FEF6FA",
            borderLeft: "3px solid #F25C8A",
            borderRadius: "0 8px 8px 0",
            padding: "12px 44px 12px 14px",
            marginBottom: 20,
          }}>
            <EditIcon onClick={goToMessageStep} id="msg" />
            <p style={{
              margin: "0 0 4px",
              fontSize: 9,
              fontWeight: 700,
              color: "#F25C8A",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              Message from {formData.yourFullName || "Sender"}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#333333", lineHeight: 1.65 }}>
              "{personalMessage}"
            </p>
          </div>
        )}

        {/* ── GIFT ROW ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "stretch" }}>

          {/* Left — card image */}
          <div style={{
            position: "relative",
            flex: "0 0 46%",
            minHeight: 200,
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid #E8E4E0",
          }}>
            <EditIcon onClick={goToOccationCategoryStep} id="img" />
            {selectedSubCategory?.image ? (
              <Image
                src={selectedSubCategory.image}
                alt="Gift card"
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                minHeight: 200,
                background: "linear-gradient(135deg,#FEF0F5 0%,#FEF4EE 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}>
                🎁
              </div>
            )}
          </div>

          {/* Right — details */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>

            {/* Brand badge / logo */}
            {selectedBrand?.logo ? (
              <img
                src={selectedBrand.logo}
                alt={selectedBrand.name}
                style={{ maxWidth: 60, height: "auto", display: "block" }}
              />
            ) : (
              <span style={{
                alignSelf: "flex-start",
                padding: "3px 10px",
                background: "linear-gradient(135deg,#F25C8A,#F2845C)",
                borderRadius: 6,
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
              }}>
                {brandName}
              </span>
            )}

            {/* Code · Amount · Expiry */}
            <div style={{
              flex: 1,
              position: "relative",
              backgroundColor: "#FAFAF8",
              borderRadius: 10,
              padding: "12px 40px 12px 12px",
              border: "1px solid #E8E4E0",
            }}>
              <EditIcon onClick={goToAmountStep} id="amt" />

              <p style={labelStyle}>Gift Code</p>
              <p style={valueStyle}>XXX-XXX-XXX</p>

              <p style={labelStyle}>Amount</p>
              <p style={valueStyle}>
                {getCurrencySymbol(selectedAmount?.currency)}{selectedAmount?.value}
              </p>

              <p style={labelStyle}>Valid Until</p>
              <p style={{ ...valueStyle, marginBottom: 0 }}>
                {selectedAmount?.expiryDate || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA BUTTON ── */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            onClick={() => {
              const raw =
                selectedBrand?.website ||
                selectedBrand?.domain ||
                (selectedBrand?.slug ? `https://${selectedBrand.slug}.myshopify.com` : null);
              if (raw) window.open(raw.startsWith("http") ? raw : `https://${raw}`, "_blank");
            }}
            style={{
              display: "inline-block",
              padding: "12px 40px",
              background: "linear-gradient(135deg,#F25C8A 0%,#F2845C 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.3,
              boxShadow: "0 4px 12px rgba(242,92,138,0.28)",
              fontFamily: "'DM Sans', Arial, sans-serif",
            }}
          >
            Redeem Now →
          </button>
        </div>

        {/* ── HOW TO USE ── */}
        <div style={{
          backgroundColor: "#FFFDF0",
          borderRadius: 10,
          padding: "14px 18px",
          border: "1px solid #F0E5A0",
        }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#111111" }}>
            💡 How to use your gift card
          </p>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#555555", lineHeight: 1.9 }}>
            <li>Click <strong style={{ color: "#111111" }}>Redeem Now</strong> above to visit the store.</li>
            <li>Add items to your cart and proceed to checkout.</li>
            <li>Enter your gift code at payment to apply the balance.</li>
            <li>Enjoy your <strong style={{ color: "#111111" }}>{brandName}</strong> experience!</li>
          </ol>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        padding: "18px 24px",
        backgroundColor: "#F8F6F2",
        borderTop: "1px solid #E8E4E0",
        textAlign: "center",
      }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, color: "#999999", lineHeight: 1.6 }}>
          This gift card was sent via{" "}
          <strong style={{ color: "#F25C8A" }}>WoveGifts</strong>, powered by MyPerks.
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "#999999" }}>
          Need help?{" "}
          <a
            href="mailto:hello@wovegifts.com"
            style={{ color: "#333333", textDecoration: "none", fontWeight: 600, borderBottom: "1px solid #CCCCCC" }}
          >
            hello@wovegifts.com
          </a>
        </p>
        <p style={{ margin: 0, fontSize: 10, color: "#CCCCCC" }}>
          © 2026 WoveGifts. All rights reserved.
        </p>
      </div>
    </div>
  );
}
