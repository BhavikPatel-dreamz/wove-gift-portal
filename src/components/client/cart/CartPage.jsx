'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext'
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/forms/Button';
import Header from '../../../components/client/home/Header';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
 const session = useSession();
  const router = useRouter();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(items);
  }, []);


  const handleRemoveItem = (index) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
    localStorage.setItem('cart', JSON.stringify(newCartItems));
    window.dispatchEvent(new Event('storage')); // To update header count
  };

  const handleProceedToPayment = () => {
    if (session) {
      router.push('/checkout');
    } else {
      router.push('/login?redirect=/cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const value = typeof item.selectedAmount === 'object' ? item.selectedAmount.value : item.selectedAmount;
      return total + (Number(value) || 0);
    }, 0).toFixed(2);
  };

  const formatAmount = (amount) => {
    if (typeof amount === "object" && amount?.value && amount?.currency) {
      return `${amount.currency} ${amount.value}`;
    }
    return `R${amount || 0}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-gray-500 hover:text-gray-800">
            <ArrowLeft size={20} className="mr-2" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Your Shopping Cart</h1>
        <p className="text-gray-600 mb-10">Review your items and proceed to a seamless checkout.</p>

        {cartItems.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
            <ShoppingBag className="mx-auto h-20 w-20 text-gray-300" />
            <h2 className="mt-6 text-3xl font-bold text-gray-800">Your cart is empty</h2>
            <p className="mt-2 text-lg text-gray-500">Looks like you haven’t added any gifts to your cart yet.</p>
            <Link
              href="/"
              className="mt-8 inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold text-center"
            >
              Start Gifting Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-start gap-6 transition-all hover:shadow-lg hover:border-pink-200">
                  <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border">
                    <img src={item.selectedBrand?.logo} alt={item.selectedBrand?.brandName} className="w-full h-full object-contain p-3 rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800">{item.selectedBrand?.brandName || item.selectedBrand?.name}</h3>
                    <p className="font-bold text-pink-600 text-lg my-1">
                      {formatAmount(item.selectedAmount)}
                    </p>
                    <p className="text-gray-500 text-sm italic line-clamp-2">“{item.personalMessage || 'No personal message.'}”</p>
                  </div>
                  <button onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                    <Trash2 size={22} />
                  </button>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-7 border-2 border-gray-200 shadow-sm sticky top-28">
                <h2 className="text-2xl font-bold mb-5 border-b pb-4">Order Summary</h2>
                <div className="space-y-3 text-lg">
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Subtotal</span>
                    <span>R{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Taxes & Fees</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline font-extrabold text-2xl mt-6 pt-6 border-t-2 border-dashed">
                  <span>Total</span>
                  <span>R{calculateTotal()}</span>
                </div>
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full mt-8 text-lg py-3"
                >
                  {session ? 'Proceed to Payment' : 'Login to Continue'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


export default CartPage;
