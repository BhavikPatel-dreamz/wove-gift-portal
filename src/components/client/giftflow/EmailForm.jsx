import React from 'react';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import { setCurrentStep, setDeliveryFormEditReturn } from "../../../redux/giftFlowSlice";
import { useDispatch, useSelector } from 'react-redux';
import { COUNTRY_CODES } from "./deliveryValidation";
import { currencyList } from '../../brandsPartner/currency';

const EmailForm = ({ formData, handleInputChange, errors, renderInputError, selectedSubCategory, selectedAmount, personalMessage, selectedBrand }) => {

    const dispatch = useDispatch();
    const { deliveryMethod } = useSelector((state) => state.giftFlowReducer);

    const startEditFlow = (step) => {
        dispatch(setDeliveryFormEditReturn({
            enabled: true,
            method: deliveryMethod || 'email',
            returnStep: 6,
        }));
        dispatch(setCurrentStep(step));
    };

    const goToMessageStep = () => { startEditFlow(5); }
    const goToAmountStep = () => { startEditFlow(2); }
    const goToOccationCategoryStep = () => { startEditFlow(4); }

    const getCurrencySymbol = (code) =>
        currencyList.find((c) => c.code === code)?.symbol || "R";

    const previewBrandLogo =
        selectedBrand?.logo ||
        selectedBrand?.brandLogo ||
        selectedSubCategory?.brandLogo ||
        selectedSubCategory?.logo ||
        null;

    const previewBrandName =
        selectedBrand?.brandName ||
        selectedBrand?.name ||
        selectedSubCategory?.brandName ||
        selectedSubCategory?.name ||
        'Brand';

    const EditBtn = ({ onClick, style = {} }) => (
        <button onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block', ...style }}>
            <svg width="28" height="28" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.46875" y="0.46875" width="29.0625" height="29.0625" rx="14.5312" fill="white" />
                <rect x="0.46875" y="0.46875" width="29.0625" height="29.0625" rx="14.5312" stroke="url(#ep0)" strokeWidth="0.9375" />
                <path d="M9.375 18.4125V20.3125C9.375 20.4875 9.5125 20.625 9.6875 20.625H11.5875C11.6688 20.625 11.75 20.5938 11.8062 20.5313L18.6312 13.7125L16.2875 11.3688L9.46875 18.1875C9.40625 18.25 9.375 18.325 9.375 18.4125ZM20.4437 11.9C20.5017 11.8422 20.5477 11.7735 20.579 11.6979C20.6104 11.6223 20.6265 11.5412 20.6265 11.4594C20.6265 11.3775 20.6104 11.2965 20.579 11.2209C20.5477 11.1453 20.5017 11.0766 20.4437 11.0188L18.9813 9.55625C18.9234 9.49831 18.8547 9.45234 18.7791 9.42098C18.7035 9.38962 18.6225 9.37347 18.5406 9.37347C18.4588 9.37347 18.3777 9.38962 18.3021 9.42098C18.2265 9.45234 18.1578 9.49831 18.1 9.55625L16.9563 10.7L19.3 13.0438L20.4437 11.9Z" fill="url(#ep1)" />
                <defs>
                    <linearGradient id="ep0" x1="-2.08158e-07" y1="11.0377" x2="28.5565" y2="23.7874" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ED457D" /><stop offset="1" stopColor="#FA8F42" />
                    </linearGradient>
                    <linearGradient id="ep1" x1="9.375" y1="13.5132" x2="20.0851" y2="18.295" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ED457D" /><stop offset="1" stopColor="#FA8F42" />
                    </linearGradient>
                </defs>
            </svg>
        </button>
    );

    return (
        <div className="text-black">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-0 sm:px-2 pb-6 sm:pb-8">
                <div>
                    <div className="text-left pt-8 pb-4 px-2">
                        <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2 fontPoppins">Email Details</h2>
                    </div>
                    {/* Left Side - Form */}
                    <div className="space-y-6">
                        {/* Your Information Section */}
                        <div className="rounded-2xl border border-gray-200">
                            <div className="flex items-center mb-4  border-b border-gray-200 p-4">
                                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 shrink-0">
                                    <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.0003 4.66669C15.238 4.66669 16.425 5.15835 17.3002 6.03352C18.1753 6.90869 18.667 8.09568 18.667 9.33335C18.667 10.571 18.1753 11.758 17.3002 12.6332C16.425 13.5084 15.238 14 14.0003 14C12.7626 14 11.5757 13.5084 10.7005 12.6332C9.82532 11.758 9.33366 10.571 9.33366 9.33335C9.33366 8.09568 9.82532 6.90869 10.7005 6.03352C11.5757 5.15835 12.7626 4.66669 14.0003 4.66669ZM14.0003 16.3334C19.157 16.3334 23.3337 18.4217 23.3337 21V23.3334H4.66699V21C4.66699 18.4217 8.84366 16.3334 14.0003 16.3334Z" fill="#398FAE" />
                                    </svg>
                                </div>
                                <div className="flex items-center">
                                    <h3 className="text-lg font-bold text-gray-900 ">Your Information</h3>
                                </div>
                            </div>

                            <div className="space-y-4 m-4 sm:m-6">
                                <div>
                                    <input
                                        type="text"
                                        value={formData.yourFullName}
                                        onChange={(e) => handleInputChange('yourFullName', e.target.value)}
                                        autoComplete="name"
                                        placeholder="Your Full Name*"
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourFullName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'}`}
                                    />
                                    {renderInputError('yourFullName')}
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        value={formData.yourEmailAddress}
                                        onChange={(e) => handleInputChange('yourEmailAddress', e.target.value)}
                                        autoComplete="email"
                                        inputMode="email"
                                        placeholder="Your Email Address*"
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourEmailAddress ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'}`}
                                    />
                                    {renderInputError('yourEmailAddress')}
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-600 block mb-2">Your Phone Number (Optional)</label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <select
                                            value={formData.yourPhoneCountryCode}
                                            onChange={(e) => handleInputChange('yourPhoneCountryCode', e.target.value)}
                                            className="w-full sm:w-[170px] p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-white text-sm"
                                            aria-label="Your phone country code"
                                        >
                                            {COUNTRY_CODES.map(({ code, country }) => (
                                                <option key={`${code}-${country}`} value={code}>{code} {country}</option>
                                            ))}
                                        </select>
                                        <div className="flex-1">
                                            <input
                                                type="tel"
                                                value={formData.yourPhoneNumber}
                                                onChange={(e) => handleInputChange('yourPhoneNumber', e.target.value)}
                                                inputMode="numeric"
                                                autoComplete="tel-national"
                                                maxLength={15}
                                                placeholder="Your Phone Number"
                                                className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.yourPhoneNumber ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'}`}
                                            />
                                        </div>
                                    </div>
                                    {renderInputError('yourPhoneNumber')}
                                </div>
                            </div>
                        </div>

                        {/* Recipient Details Section */}
                        <div className="rounded-2xl border border-gray-200">
                            <div className="flex items-center border-b border-gray-200 mb-4 p-4">
                                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mr-3 shrink-0">
                                    <div className="absolute inset-0 bg-[#398FAE] opacity-20 rounded-xl"></div>
                                    <Mail className="relative w-6 h-6 text-[#398FAE]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Recipient Details</h3>
                                </div>
                            </div>

                            <div className="space-y-4 m-4 sm:m-6">
                                <div>
                                    <input
                                        type="text"
                                        value={formData.recipientFullName}
                                        onChange={(e) => handleInputChange('recipientFullName', e.target.value)}
                                        autoComplete="name"
                                        placeholder="Recipient's Name*"
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientFullName ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'}`}
                                    />
                                    {renderInputError('recipientFullName')}
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        value={formData.recipientEmailAddress}
                                        onChange={(e) => handleInputChange('recipientEmailAddress', e.target.value)}
                                        autoComplete="email"
                                        inputMode="email"
                                        placeholder="Email Address*"
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-white text-sm ${errors.recipientEmailAddress ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-blue-400 focus:border-blue-400'}`}
                                    />
                                    {renderInputError('recipientEmailAddress')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT SIDE — Email Preview ─── */}
                <div className="">
                    {/* Decorative Circle Background */}
                    <div className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-linear-to-br from-blue-100 to-blue-200 opacity-50 blur-2xl -z-10 sm:h-80 sm:w-80 lg:left-auto lg:translate-x-0"></div>

                    <div className="relative z-10 w-full">
                        <div className="flex items-center justify-between text-left pt-8 pb-4 px-2">
                            <h2 className="text-[22px] font-semibold text-[#1A1A1A] mb-2 fontPoppins">Preview</h2>
                        </div>

                        {/* Email client shell card — same outer wrapper as original */}
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 w-full max-w-3xl mx-auto">

                            {/* ── Email Subject line (original) ── */}
                            <div className="px-4 py-3 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🎁</span>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {`${selectedSubCategory?.name} - You've received a gift from ${formData?.yourFullName}`}
                                    </p>
                                </div>
                            </div>

                            {/* ── From / time row (original) ── */}
                            <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-600">D</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">Friend</p>
                                        <p className="text-xs text-gray-600 truncate">&lt;hello@friend.com&gt;</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">12:30 PM (40 minutes ago)</span>
                            </div>

                            {/* ── Email Body — now matches HTML email template ── */}
                            <div style={{ padding: '16px 10px', fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                <div style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

                                    {/* Header */}
                                    <div style={{ background: 'linear-gradient(135deg,#F25C8A 0%,#F2845C 100%)', padding: '24px 28px', textAlign: 'center' }}>
                                        <p style={{ margin: '0 0 6px', fontSize: 24, lineHeight: 1 }}>🎁</p>
                                        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px', lineHeight: 1.3, fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                            You&apos;ve received a Gift Card!
                                        </h1>
                                    </div>

                                    {/* Body content */}
                                    <div style={{ padding: '24px 24px 0 24px' }}>

                                        {/* Greeting */}
                                        <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#111111', fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                            Hi {formData.recipientFullName || 'Recipient'},
                                        </p>
                                        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#555555', lineHeight: 1.7, fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                            <strong style={{ color: '#111111', fontWeight: 600 }}>{formData.yourFullName || 'Friend'}</strong> has sent you a{' '}
                                            <strong style={{ color: '#111111', fontWeight: 600 }}>{selectedSubCategory?.name || 'Gift Card'}</strong> gift card.
                                        </p>

                                        {/* Personal Message */}
                                        {personalMessage && (
                                            <div style={{ position: 'relative', background: '#FEF6FA', borderLeft: '3px solid #F25C8A', padding: '12px 40px 12px 14px', borderRadius: '0 8px 8px 0', marginBottom: 20 }}>
                                                <div style={{ position: 'absolute', top: 7, right: 7 }}>
                                                    <EditBtn onClick={goToMessageStep} />
                                                </div>
                                                <p style={{ margin: '0 0 4px', fontSize: 9, fontWeight: 700, color: '#F25C8A', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                                    Message from {formData.yourFullName || 'Sender'}
                                                </p>
                                                <p style={{ margin: 0, fontSize: 12, color: '#333333', lineHeight: 1.6, fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                                    &quot;{personalMessage}&quot;
                                                </p>
                                            </div>
                                        )}

                                        {/* Gift card row — mirrors HTML email template */}
                                        <div style={{ display: 'flex', gap: 12, marginBottom: 20, height: 200 }}>

                                            {/* Left: Gift Card Image */}
                                            <div style={{ position: 'relative', width: '48%', height: '100%', borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E4E0', flexShrink: 0 }}>
                                                <div style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}>
                                                    <EditBtn onClick={goToOccationCategoryStep} />
                                                </div>
                                                {selectedSubCategory?.image ? (
                                                    <Image src={selectedSubCategory.image} alt="Gift card" fill style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#fde8f0,#fde0cc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ fontSize: 36 }}>🎁</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: brand logo on top + details card below */}
                                            <div style={{ width: '52%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>

                                                {/* Brand logo */}
                                                <div style={{ width: '100%', textAlign: 'left' }}>
                                                    {previewBrandLogo ? (
                                                        <img
                                                            src={previewBrandLogo}
                                                            alt={previewBrandName}
                                                            style={{
                                                                width: '100%',
                                                                maxWidth: 180,
                                                                maxHeight: 60,
                                                                objectFit: 'contain',
                                                                objectPosition: 'left',
                                                                display: 'block',
                                                                margin: '0',
                                                            }}
                                                        />
                                                    ) : (
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                color: '#333',
                                                                textAlign: 'left',
                                                                fontFamily: "'DM Sans', Arial, sans-serif",
                                                                display: 'block',
                                                            }}
                                                        >
                                                            {previewBrandName}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Details card — stretches to fill remaining height */}
                                                <div style={{ flex: 1, background: '#FAFAF8', borderRadius: 10, padding: '10px 12px', border: '1px solid #E8E4E0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>

                                                    <div>
                                                        <p style={{ margin: '0 0 1px', fontSize: 8, fontWeight: 700, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'DM Sans', Arial, sans-serif" }}>Gift Code</p>
                                                        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#111111', wordBreak: 'break-all', fontFamily: "'DM Sans', Arial, sans-serif" }}>XXX-XXX-XXX</p>
                                                    </div>

                                                    <div>
                                                        <p style={{ margin: '0 0 1px', fontSize: 8, fontWeight: 700, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'DM Sans', Arial, sans-serif" }}>Amount</p>
                                                        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#111111', fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                                            {getCurrencySymbol(selectedAmount?.currency)}{selectedAmount?.value}
                                                        </p>
                                                    </div>

                                                    <div style={{ position: 'relative', paddingRight: 32 }}>
                                                        <div style={{ position: 'absolute', top: -2, right: 0 }}>
                                                            <EditBtn onClick={goToAmountStep} />
                                                        </div>
                                                        <p style={{ margin: '0 0 1px', fontSize: 8, fontWeight: 700, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'DM Sans', Arial, sans-serif" }}>Valid Until</p>
                                                        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#111111', fontFamily: "'DM Sans', Arial, sans-serif" }}>—</p>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                            <span style={{
                                                display: 'inline-block', padding: '12px 40px',
                                                background: 'linear-gradient(135deg,#F25C8A 0%,#F2845C 100%)',
                                                color: '#ffffff', borderRadius: 50, fontSize: 13, fontWeight: 700,
                                                letterSpacing: 0.3, boxShadow: '0 4px 12px rgba(242,92,138,0.35)',
                                                fontFamily: "'DM Sans', Arial, sans-serif"
                                            }}>
                                                Redeem Now →
                                            </span>
                                        </div>

                                        {/* How to use */}
                                        <div style={{ background: '#FFFDF0', borderRadius: 10, padding: '14px 18px', border: '1px solid #F0E5A0' }}>
                                            <p style={{ margin: '0 0 7px', fontSize: 11, fontWeight: 700, color: '#111111', fontFamily: "'DM Sans', Arial, sans-serif" }}>💡 How to use your gift card</p>
                                            <ol style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: '#555555', lineHeight: 1.9, fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                                <li>Click <strong style={{ color: '#111111' }}>Redeem Now</strong> above to visit the store.</li>
                                                <li>Add items to your cart and proceed to checkout.</li>
                                                <li>Enter your gift code at payment to apply the balance.</li>
                                                <li>Enjoy your <strong style={{ color: '#111111' }}>{selectedSubCategory?.name || 'gift card'}</strong> experience!</li>
                                            </ol>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div style={{ padding: '18px 24px', background: '#F8F6F2', borderTop: '1px solid #E8E4E0', textAlign: 'center', marginTop: 20 }}>
                                        <p style={{ margin: '0 0 5px', fontSize: 10, color: '#999999', lineHeight: 1.6, fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                            This gift card was sent via <strong style={{ color: '#F25C8A' }}>WoveGifts</strong>, powered by MyPerks.
                                        </p>
                                        <p style={{ margin: '0 0 8px', fontSize: 10, color: '#999999', fontFamily: "'DM Sans', Arial, sans-serif" }}>
                                            Need help?{' '}
                                            <a href="mailto:hello@wovegifts.com" style={{ color: '#333333', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid #CCCCCC' }}>
                                                hello@wovegifts.com
                                            </a>
                                        </p>
                                        <p style={{ margin: 0, fontSize: 9, color: '#CCCCCC', fontFamily: "'DM Sans', Arial, sans-serif" }}>© 2026 WoveGifts. All rights reserved.</p>
                                    </div>

                                </div>
                            </div>
                            {/* end email body */}

                        </div>
                        {/* end email client shell */}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmailForm;
