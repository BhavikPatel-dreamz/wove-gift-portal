'use client';

import { useShopifyNavigation } from '@/hooks/useShopifyNavigation';
import React from 'react';

export default function ShopifyLink({ href, children, className }) {
  const { navigate } = useShopifyNavigation();

  const handleClick = (e) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
