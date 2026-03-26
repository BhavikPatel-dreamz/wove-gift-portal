"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Provider } from 'react-redux';
import { ArrowRight } from 'lucide-react';
import store from '../../../redux/store';
import Header from '../../../components/client/home/Header';
import Footer from '../../../components/client/home/Footer';
import { addGiftCardToAccount } from '../../../lib/action/customerDashbordAction';

function AddGiftVoucherContent() {
    const router = useRouter();
    const [voucherCode, setVoucherCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successState, setSuccessState] = useState({
        visible: false,
        title: 'Voucher Added Successfully!',
        message:
            'Your gift voucher has been added to your wallet. You can now use it during checkout.',
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        const normalizedCode = voucherCode.trim();
        if (!normalizedCode) {
            setErrorMessage('Enter your gift voucher code to continue.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const result = await addGiftCardToAccount(normalizedCode);

            if (!result.success) {
                setErrorMessage(result.error || 'Unable to add this voucher right now.');
                return;
            }

            setVoucherCode('');
            setSuccessState({
                visible: true,
                title: result.alreadyAdded ? 'Voucher Already Added!' : 'Voucher Added Successfully!',
                message: result.alreadyAdded
                    ? 'This gift voucher is already in your wallet and ready to use during checkout.'
                    : 'Your gift voucher has been added to your wallet. You can now use it during checkout.',
            });
        } catch (error) {
            console.error('Error adding voucher:', error);
            setErrorMessage(error?.message || 'Unable to add this voucher right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FAFAFA] px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
            <div className="mx-auto max-w-[920px]  mt-[4%]">
                <div className="rounded-[28px]  px-6 sm:px-10">
                    {successState.visible ? (
                        <div className="mx-auto flex max-w-[620px] mt-[20%] flex-col items-center text-center">
                            <h1 className="font-poppins font-bold text-[28px] leading-[34px] text-center text-[#1A1A1A]
               sm:text-[32px] sm:leading-[38px]
               md:text-[36px] md:leading-[42px]
               lg:text-[40px] lg:leading-[45px]">
                                {successState.title}
                            </h1>

                            <p className="mt-3 max-w-[90%] mx-auto font-inter font-medium text-sm leading-5 text-center text-[#4A4A4A]
              sm:mt-4 sm:max-w-[520px] sm:text-base sm:leading-6">
                                {successState.message}
                            </p>

                            <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => router.push('/my-gift?tab=received')}
                                    className="inline-flex h-12 items-center justify-center rounded-full border border-[#F06B8E] px-7 text-sm font-semibold text-[#EF4F88] transition hover:bg-[#FFF4F7]"
                                >
                                    View Your Voucher
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-[#EF4E86] to-[#FF9B43] px-8 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(239,78,134,0.22)] transition hover:shadow-[0_16px_36px_rgba(239,78,134,0.28)]"
                                >
                                    Back to Home
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-[760px]">
                            <div className="text-center">
                                <h1 className="font-poppins font-bold text-[28px] leading-[34px] text-center text-[#1A1A1A]
               sm:text-[32px] sm:leading-[38px]
               md:text-[36px] md:leading-[42px]
               lg:text-[40px] lg:leading-[45px]">
                                    Add Gift Voucher
                                </h1>
                                <p className="mx-auto mt-3 max-w-[90%] font-inter font-medium text-sm leading-5 text-center text-[#4A4A4A]
              sm:mt-4 sm:max-w-[560px] sm:text-base sm:leading-6">
                                    Enter the gift voucher code you received to add it to your wallet. Once added, you can use it during checkout to redeem your gift.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-10 rounded-[24px] border border-[#ECE7E5] bg-white px-5 py-6 shadow-[0_16px_38px_rgba(15,23,42,0.04)] sm:px-7 sm:py-8"
                            >
                                <label
                                    htmlFor="gift-voucher-code"
                                    className="block font-inter font-bold text-[16px] leading-[20px] tracking-normal text-[#1A1A1A]"
                                >
                                    Gift Voucher Code*
                                </label>
                                <input
                                    id="gift-voucher-code"
                                    type="text"
                                    value={voucherCode}
                                    onChange={(event) => {
                                        setVoucherCode(event.target.value);
                                        setErrorMessage('');
                                    }}
                                    placeholder="Enter Your Code Here"
                                    className="mt-3 h-14 w-full rounded-2xl border border-[#DDD8D5] bg-white px-4 text-sm text-[#1F1F24] outline-none transition focus:border-[#EF4E86] focus:ring-2 focus:ring-[#F9CAD9]"
                                />

                                {errorMessage && (
                                    <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-4 inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#EF4E86] to-[#FF9B43] px-6 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(239,78,134,0.2)] transition hover:shadow-[0_18px_36px_rgba(239,78,134,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Adding Your Voucher...' : 'Add Your Voucher'}
                                </button>

                                <p className="mt-4 px-4 font-inter font-normal text-[13px] leading-[18px] text-center text-[#858585]
              sm:mt-5 sm:px-0 sm:text-[14px] sm:leading-[20px]">
                                    Once added, the gift voucher will appear in your Wallet / My Gift Cards section and can be used during checkout.
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function Page() {
    return (
        <Provider store={store}>
            <div className="min-h-screen bg-[#FAFAFA]">
                <Header />
                <AddGiftVoucherContent />
                <Footer />
            </div>
        </Provider>
    );
}
