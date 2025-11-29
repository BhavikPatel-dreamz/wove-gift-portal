'use client';

import { useShopifyNavigation } from '@/hooks/useShopifyNavigation';
import React from 'react';

interface ShopifyLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Link component for Shopify embedded apps
 * Uses App Bridge navigation instead of Next.js router
 */
export default function ShopifyLink({ href, children, className }: ShopifyLinkProps) {
  const { navigate } = useShopifyNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
