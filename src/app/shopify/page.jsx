"use client";

import React from "react";
import { ShopAdminLayout } from "../../components/shopAdmin/ShopAdminLayout";

const page = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const shopParam = urlParams.get("shop");

  console.log("shopParam-----------------",shopParam);
  

  return <ShopAdminLayout>{shopParam}</ShopAdminLayout>;
};

export default page;
