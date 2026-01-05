"use client";
import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  Plus,
  Edit,
  Star,
  MoreVertical,
  Trash2,
  Loader,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc,
  Power,
  History,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  createBrandPartner,
  updateBrand,
  deleteBrandPartner,
} from "../../../lib/action/brandPartner";
import CustomDropdown from "../../../components/ui/CustomDropdown";
import { Categories } from "../../../lib/resourses";

const BrandManager = ({
  initialBrands,
  initialPagination,
  initialStatistics,
  initialCategoryStats,
  searchParams,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [brands, setBrands] = useState(initialBrands);
  const [pagination, setPagination] = useState(initialPagination);
  const [statistics, setStatistics] = useState(initialStatistics);
  const [categoryStats, setCategoryStats] = useState(initialCategoryStats);
  const [actionLoading, setActionLoading] = useState(false);

  // Local state for immediate UI updates
  const [searchInput, setSearchInput] = useState(searchParams?.search || "");
  const [debounceTimer, setDebounceTimer] = useState(null);

  const filters = {
    search: searchParams?.search || "",
    category: searchParams?.category || "All Brands",
    isActive: searchParams?.isActive || null,
    isFeature: searchParams?.isFeature || null,
    sortBy: searchParams?.sortBy || "createdAt",
    sortOrder: searchParams?.sortOrder || "desc",
  };

  // Update local state when props change
  useEffect(() => {
    setBrands(initialBrands);
    setPagination(initialPagination);
    setStatistics(initialStatistics);
    setCategoryStats(initialCategoryStats);
  }, [
    initialBrands,
    initialPagination,
    initialStatistics,
    initialCategoryStats,
  ]);

  // Update search input when URL changes
  useEffect(() => {
    setSearchInput(searchParams?.search || "");
  }, [searchParams?.search]);

  // Helper function to build URL with search params
  const buildUrlWithParams = (updates) => {
    const params = new URLSearchParams();

    // Start with current params
    Object.entries(searchParams || {}).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "All Brands" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change (except for page changes)
    if (!updates.page && !updates.limit) {
      params.set("page", "1");
    }

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const handleFilterChange = (key, value) => {
    startTransition(() => {
      const newUrl = buildUrlWithParams({ [key]: value });
      router.push(newUrl);
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced search
    const timer = setTimeout(() => {
      startTransition(() => {
        const newUrl = buildUrlWithParams({ search: value });
        router.push(newUrl);
      });
    }, 500); // 500ms debounce

    setDebounceTimer(timer);
  };

  const handlePageChange = (newPage) => {
    startTransition(() => {
      const newUrl = buildUrlWithParams({ page: newPage.toString() });
      router.push(newUrl);
    });

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newLimit) => {
    startTransition(() => {
      const newUrl = buildUrlWithParams({
        limit: newLimit.toString(),
        page: "1",
      });
      router.push(newUrl);
    });
  };

  const createFormData = (
    brandData,
    isUpdate = false,
    existingBrand = null
  ) => {
    const formDataToSend = new FormData();

    if (isUpdate && existingBrand) {
      formDataToSend.append("id", existingBrand.id);
    }

    const fieldsToAppend = {
      brandName: brandData.brandName || existingBrand?.brandName || "",
      tagline: brandData.tagline || existingBrand?.tagline || "",
      categoryName: brandData.categoryName || existingBrand?.categoryName || "",
      website: brandData.website || existingBrand?.website || "",
      description: brandData.description || existingBrand?.description || "",
      contact: brandData.contact || existingBrand?.contact || "",
      notes: brandData.notes || existingBrand?.notes || "",
      color: brandData.color || existingBrand?.color || "#000000",
      isFeature:
        brandData.isFeature !== undefined
          ? brandData.isFeature
          : existingBrand?.isFeature || false,
      isActive:
        brandData.isActive !== undefined
          ? brandData.isActive
          : existingBrand?.isActive !== undefined
            ? existingBrand.isActive
            : true,
    };

    Object.keys(fieldsToAppend).forEach((key) => {
      if (key === "isFeature" || key === "isActive") {
        formDataToSend.append(key, fieldsToAppend[key].toString());
      } else {
        formDataToSend.append(key, fieldsToAppend[key]);
      }
    });

    if (brandData.logo && brandData.logo instanceof File) {
      formDataToSend.append("logo", brandData.logo);
    }

    return formDataToSend;
  };

  const handleDeleteBrand = async (brandId) => {
    if (
      !confirm(
        "Are you sure you want to delete this brand? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const result = await deleteBrandPartner(brandId);

      if (result.success) {
        toast.success("Brand deleted successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete brand");
      }
    } catch (error) {
      toast.error("Failed to delete brand");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFeatured = async (id) => {
    const brand = brands.find((b) => b.id === id);
    if (!brand) return;

    try {
      setActionLoading(true);

      const toggleData = {
        ...brand,
        isFeature: !brand.isFeature,
        logo: null,
      };

      const formDataToSend = createFormData(toggleData, true, brand);
      const result = await updateBrand(formDataToSend);

      if (result.success) {
        toast.success(
          `Brand ${!brand.isFeature ? "featured" : "unfeatured"} successfully`
        );
        router.refresh();
      } else {
        toast.error("Failed to update brand");
      }
    } catch (error) {
      toast.error("Failed to update brand");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleActive = async (id) => {
    const brand = brands.find((b) => b.id === id);
    if (!brand) return;

    try {
      setActionLoading(true);

      const toggleData = {
        ...brand,
        isActive: !brand.isActive,
        logo: null,
      };

      const formDataToSend = createFormData(toggleData, true, brand);
      const result = await updateBrand(formDataToSend);

      if (result.success) {
        toast.success(
          `Brand ${!brand.isActive ? "activated" : "deactivated"} successfully`
        );
        router.refresh();
      } else {
        toast.error("Failed to update brand");
      }
    } catch (error) {
      toast.error("Failed to update brand");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (brand) => {
    router.push(`/brandsPartner/edit/${brand.id}`);
  };

  const handleReviewClick = (brand) => {
    router.push(`/brandsPartner/edit/${brand.id}?mode=review`);
  };

  const redirectToSettlement = (brandId) => {
    router.push(`/brandsPartner/${brandId}/settlements`);
  };

  const getCategoryColor = (category) => {
    if (category?.includes("Fashion"))
      return "bg-pink-50 text-pink-700 border-pink-200";
    if (category === "Clothing")
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (category === "Footwear")
      return "bg-blue-50 text-blue-700 border-blue-200";
    if (category === "Sports")
      return "bg-green-50 text-green-700 border-green-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const clearAllFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== "All Brands" ||
    filters.isActive ||
    filters.isFeature;

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between flex-col md:flex-row gap-6 items-start mb-6">
          <div className="flex items-center gap-4">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="60"
                height="60"
                rx="6"
                fill="#1F59EE"
                fillOpacity="0.08"
              />
              <path
                d="M23.816 32.8496V44.8496C23.816 45.2032 23.6756 45.5424 23.4255 45.7924C23.1755 46.0425 22.8363 46.1829 22.4827 46.1829H17.1494C16.7958 46.1829 16.4566 46.0425 16.2066 45.7924C15.9565 45.5424 15.816 45.2032 15.816 44.8496V32.8496C15.816 32.496 15.9565 32.1568 16.2066 31.9068C16.4566 31.6568 16.7958 31.5163 17.1494 31.5163H22.4827C22.8363 31.5163 23.1755 31.6568 23.4255 31.9068C23.6756 32.1568 23.816 32.496 23.816 32.8496ZM33.1494 16.8496H27.816C27.4624 16.8496 27.1233 16.9901 26.8732 17.2401C26.6232 17.4902 26.4827 17.8293 26.4827 18.1829V44.8496C26.4827 45.2032 26.6232 45.5424 26.8732 45.7924C27.1233 46.0425 27.4624 46.1829 27.816 46.1829H33.1494C33.503 46.1829 33.8421 46.0425 34.0922 45.7924C34.3422 45.5424 34.4827 45.2032 34.4827 44.8496V18.1829C34.4827 17.8293 34.3422 17.4902 34.0922 17.2401C33.8421 16.9901 33.503 16.8496 33.1494 16.8496ZM43.816 23.5163H38.4827C38.1291 23.5163 37.7899 23.6568 37.5399 23.9068C37.2898 24.1568 37.1494 24.496 37.1494 24.8496V44.8496C37.1494 45.2032 37.2898 45.5424 37.5399 45.7924C37.7899 46.0425 38.1291 46.1829 38.4827 46.1829H43.816C44.1697 46.1829 44.5088 46.0425 44.7589 45.7924C45.0089 45.5424 45.1494 45.2032 45.1494 44.8496V24.8496C45.1494 24.496 45.0089 24.1568 44.7589 23.9068C44.5088 23.6568 44.1697 23.5163 43.816 23.5163Z"
                fill="#1F59EE"
              />
            </svg>

            <div>
              <h1 className="font-poppins text-[22px] font-semibold leading-[20px] text-[#1A1A1A]">
                Brand Manager
              </h1>
              <p className="font-inter text-sm font-medium leading-[18px] text-[#64748B] mt-1">
                Manage your brand partnerships with style
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/brandsPartner/new")}
            disabled={actionLoading}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actionLoading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <Plus size={20} />
            )}
            Add New Brand
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="45"
                  height="45"
                  rx="6"
                  fill="#00813B"
                  fillOpacity="0.08"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M33.4202 22.0651L33.9411 21.7619C34.5414 21.3404 34.9138 20.7784 34.9138 20.1781V17.9778L32.6944 12.6535C32.4465 12.0592 31.9697 11.6377 31.3172 11.6377H14.4596C13.8061 11.6377 13.3304 12.0592 13.0824 12.6535L10.8621 17.9778V20.1781C10.8621 22.2136 14.7767 23.3852 17.1508 21.7164C17.6828 21.3424 18.0572 20.83 18.0572 20.1781H19.2909C19.2909 22.2065 23.2148 23.3758 25.5134 21.7619C26.1136 21.3404 26.4861 20.7784 26.4861 20.1781H27.7197C27.7197 22.0974 31.1275 23.1647 33.4202 22.0651ZM20.4602 33.3616H25.3164V27.4551C25.3164 27.1408 25.0594 26.8821 24.7473 26.8821H21.0292C20.717 26.8821 20.4601 27.1408 20.4601 27.4551L20.4602 33.3616ZM22.8884 23.7601C24.5095 23.7601 26.1778 23.1395 27.0911 21.9499C28.3789 23.6216 31.1332 24.0946 33.1219 23.5003V32.0216C33.1219 32.7675 32.5066 33.3618 31.7658 33.3618H26.5501V27.4553C26.5501 26.4557 25.7401 25.6401 24.7473 25.6401H21.0292C20.0365 25.6401 19.2264 26.4557 19.2264 27.4553V33.3618H14.0097C13.269 33.3618 12.6536 32.7675 12.6536 32.0216L12.6546 23.5003C14.6441 24.0946 17.3985 23.6216 18.6854 21.9499C19.5989 23.1395 21.2674 23.7601 22.8884 23.7601Z"
                  fill="#00813B"
                />
              </svg>
              <div>
                <div className="font-inter text-2xl font-bold leading-[20px] text-[#00813B]">
                  {statistics.active}
                </div>

                <div className="font-poppins text-base font-medium leading-[20px] text-[#00813B]">
                  Active Brands
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="45"
                  height="45"
                  rx="6"
                  fill="#A55E00"
                  fillOpacity="0.08"
                />
                <g clipPath="url(#clip0_1787_1507)">
                  <path
                    d="M30.1636 17.3436L26.0647 16.748L24.2316 13.0338C23.5238 11.5996 21.4765 11.599 20.7684 13.0338L18.9353 16.748L14.8364 17.3436C13.2536 17.5736 12.6206 19.5205 13.7662 20.6373L16.7322 23.5285L16.0321 27.6108C15.7617 29.187 17.4175 30.3908 18.8339 29.6464L22.5 27.7189L26.1662 29.6464C27.5843 30.3918 29.2377 29.1835 28.9679 27.6108L28.2677 23.5285L31.2338 20.6373C32.379 19.5209 31.747 17.5737 30.1636 17.3436ZM16.6195 12.3723L15.6298 11.0101C15.3611 10.6404 14.8435 10.5584 14.4738 10.8271C14.1041 11.0957 14.0221 11.6133 14.2908 11.983L15.2805 13.3452C15.5494 13.7151 16.0669 13.7968 16.4365 13.5283C16.8062 13.2597 16.8881 12.7421 16.6195 12.3723ZM13.335 24.5803C13.1937 24.1457 12.727 23.9076 12.2922 24.049L10.6583 24.5799C10.2236 24.7211 9.98575 25.188 10.127 25.6227C10.2685 26.0582 10.7362 26.2951 11.1698 26.154L12.8037 25.6231C13.2384 25.4819 13.4763 25.015 13.335 24.5803ZM30.5262 10.8271C30.1565 10.5584 29.639 10.6404 29.3703 11.0101L28.3805 12.3723C28.1118 12.7421 28.1938 13.2597 28.5636 13.5283C28.9335 13.797 29.4509 13.7148 29.7195 13.3452L30.7093 11.983C30.978 11.6133 30.896 11.0957 30.5262 10.8271ZM34.3418 24.5799L32.7078 24.049C32.2731 23.9075 31.8062 24.1456 31.665 24.5803C31.5237 25.015 31.7616 25.4818 32.1963 25.6231L33.8303 26.154C34.2641 26.2951 34.7316 26.058 34.8731 25.6227C35.0143 25.188 34.7764 24.7212 34.3418 24.5799ZM22.5 30.9956C22.043 30.9956 21.6724 31.3661 21.6724 31.8231V33.5028C21.6724 33.9598 22.043 34.3303 22.5 34.3303C22.957 34.3303 23.3275 33.9598 23.3275 33.5028V31.8231C23.3276 31.3661 22.9571 30.9956 22.5 30.9956Z"
                    fill="#A55E00"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1787_1507">
                    <rect
                      width="24.8276"
                      height="24.8276"
                      fill="white"
                      transform="translate(10.0862 10.0859)"
                    />
                  </clipPath>
                </defs>
              </svg>
              <div>
                <div className="font-inter text-2xl font-bold leading-[20px] text-[#A55E00]">
                  {statistics.featured}
                </div>

                <div className="font-poppins text-base font-medium leading-[20px] text-[#A55E00]">
                  Featured
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="45"
                  height="45"
                  rx="6"
                  fill="#0D4FE1"
                  fillOpacity="0.08"
                />
                <path
                  d="M29.4829 14.6872V15.4997L25.2283 13.2489C23.6178 12.4035 21.3704 12.4035 19.7719 13.2489L15.5174 15.5106V14.6872C15.5174 12.2169 16.9956 10.8555 19.6998 10.8555H25.3004C28.0046 10.8555 29.4829 12.2169 29.4829 14.6872Z"
                  fill="#0D4FE1"
                />
                <path
                  d="M29.5159 17.3719L29.3477 17.2882L27.7139 16.3558L24.3262 14.4073C23.293 13.8096 21.7072 13.8096 20.6741 14.4073L17.2863 16.3438L15.6525 17.3001L15.4363 17.4077C13.3339 18.8183 13.1898 19.0813 13.1898 21.3406V26.7438C13.1898 29.0031 13.3339 29.2661 15.4843 30.7125L20.6741 33.6891C21.1907 33.9999 21.8394 34.1314 22.5001 34.1314C23.1488 34.1314 23.8096 33.988 24.3262 33.6891L29.564 30.6767C31.6783 29.2661 31.8105 29.0151 31.8105 26.7438V21.3406C31.8105 19.0813 31.6663 18.8183 29.5159 17.3719ZM25.8519 23.9824L25.119 24.879C24.9989 25.0105 24.9148 25.2615 24.9268 25.4408L24.9989 26.5884C25.047 27.2937 24.5424 27.6523 23.8817 27.4013L22.8125 26.9709C22.6127 26.9112 22.3996 26.9112 22.1998 26.9709L21.1306 27.3893C20.4699 27.6523 19.9653 27.2817 20.0134 26.5765L20.0854 25.4289C20.0899 25.2249 20.0218 25.0259 19.8932 24.867L19.1484 23.9824C18.6919 23.4445 18.8961 22.8468 19.5809 22.6675L20.6981 22.3806C20.8783 22.3328 21.0826 22.1654 21.1787 22.022L21.8034 21.0657C22.1878 20.4679 22.8005 20.4679 23.1969 21.0657L23.8216 22.022C23.9177 22.1774 24.1339 22.3328 24.3021 22.3806L25.4194 22.6675C26.1041 22.8468 26.3084 23.4445 25.8519 23.9824Z"
                  fill="#0D4FE1"
                />
              </svg>

              <div>
                <div className="font-inter text-2xl font-bold leading-[20px] text-[#0D4FE1]">
                  {statistics.total}
                </div>

                <div className="font-poppins text-base font-medium leading-[20px] text-[#0D4FE1]">
                  Total Brands
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg
                width="45"
                height="45"
                viewBox="0 0 45 45"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="45"
                  height="45"
                  rx="6"
                  fill="#801CD6"
                  fillOpacity="0.08"
                />
                <path
                  d="M22.5 11.165C20.2583 11.165 18.0669 11.8298 16.203 13.0752C14.3391 14.3207 12.8863 16.0908 12.0284 18.1619C11.1706 20.233 10.9461 22.5119 11.3835 24.7106C11.8208 26.9092 12.9003 28.9288 14.4854 30.514C16.0706 32.0991 18.0901 33.1786 20.2888 33.6159C22.4874 34.0533 24.7664 33.8288 26.8375 32.9709C28.9085 32.1131 30.6787 30.6603 31.9242 28.7964C33.1696 26.9325 33.8343 24.7411 33.8343 22.4994C33.8313 19.4943 32.6361 16.6131 30.5112 14.4882C28.3863 12.3633 25.5051 11.1681 22.5 11.165ZM26.6036 26.603C26.4401 26.7663 26.2185 26.858 25.9875 26.858C25.7564 26.858 25.5348 26.7663 25.3714 26.603L21.8839 23.1155C21.7203 22.9521 21.6283 22.7305 21.6281 22.4994V15.5244C21.6281 15.2932 21.72 15.0714 21.8835 14.9079C22.047 14.7444 22.2688 14.6525 22.5 14.6525C22.7312 14.6525 22.953 14.7444 23.1165 14.9079C23.28 15.0714 23.3719 15.2932 23.3719 15.5244V22.139L26.6036 25.3707C26.7669 25.5342 26.8586 25.7558 26.8586 25.9869C26.8586 26.2179 26.7669 26.4395 26.6036 26.603Z"
                  fill="#801CD6"
                />
              </svg>

              <div>
                <div className="font-inter text-2xl font-bold leading-[20px] text-[#801CD6]">
                  {statistics.activeRate}%
                </div>

                <div className="font-poppins text-base font-medium leading-[20px] text-[#801CD6]">
                  Active Rate
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search with loading indicator */}
            <div className="relative flex-1 max-w-sm">
              <div className="absolute left-4 top-4 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z"
                    fill="#A6A6A6"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search brands by name, category, or tagline..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 text-sm py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {isPending && (
                <Loader
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin"
                  size={16}
                />
              )}
            </div>

            {/* Category Filter */}
            <CustomDropdown
              value={filters.category}
              onChange={(value) => handleFilterChange("category", value)}
              options={[
                { value: "All Brands", label: "All Brands" },
                ...Categories.map((c) => ({ value: c, label: c })),
              ]}
              placeholder="Select Category"
              className="min-w-[150px] text-sm"
            />

            {/* Status Filters */}
            <CustomDropdown
              value={filters.isActive || ""}
              onChange={(value) =>
                handleFilterChange("isActive", value || null)
              }
              options={[
                { value: "", label: "All Status" },
                { value: "true", label: "Active Only" },
                { value: "false", label: "Inactive Only" },
              ]}
              placeholder="All Status"
              className="min-w-[150px] text-sm"
            />

            <CustomDropdown
              value={filters.isFeature || ""}
              onChange={(value) =>
                handleFilterChange("isFeature", value || null)
              }
              options={[
                { value: "", label: "All Brands" },
                { value: "true", label: "Featured Only" },
                { value: "false", label: "Non-Featured" },
              ]}
              placeholder="All Brands"
              className="min-w-[150px] text-sm"
            />

            {/* Sort */}
            <div className="flex gap-2">
              <CustomDropdown
                value={filters.sortBy}
                onChange={(value) => handleFilterChange("sortBy", value)}
                options={[
                  { value: "createdAt", label: "Created Date" },
                  { value: "brandName", label: "Name" },
                  { value: "categoryName", label: "Category" },
                  { value: "updatedAt", label: "Updated Date" },
                ]}
                className="min-w-[150px] text-sm"
              />
              <button
                onClick={() =>
                  handleFilterChange(
                    "sortOrder",
                    filters.sortOrder === "asc" ? "desc" : "asc"
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Sort ${filters.sortOrder === "asc" ? "Descending" : "Ascending"
                  }`}
              >
                {filters.sortOrder === "asc" ? (
                  <SortAsc size={16} />
                ) : (
                  <SortDesc size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2 items-center">
              {filters.search && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Search: "{filters.search}"
                  <button
                    onClick={() => {
                      setSearchInput("");
                      handleFilterChange("search", "");
                    }}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.category !== "All Brands" && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Category: {filters.category}
                  <button
                    onClick={() => handleFilterChange("category", "All Brands")}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.isActive && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Status: {filters.isActive === "true" ? "Active" : "Inactive"}
                  <button
                    onClick={() => handleFilterChange("isActive", null)}
                    className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filters.isFeature && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Featured: {filters.isFeature === "true" ? "Yes" : "No"}
                  <button
                    onClick={() => handleFilterChange("isFeature", null)}
                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>


        {/* Pagination and filters */}
        <div className="flex flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
          {/* Title + count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A]">
             Brands List
            </h2>
            <span className="bg-[rgba(15,100,246,0.10)] text-[#0F64F6] px-2 py-0.5 sm:py-1 rounded-[3px] border border-[rgba(15,100,246,0.20)] text-xs sm:text-sm font-medium">
              {pagination.totalItems} Brands
            </span>
          </div>

          {/* Items per page selector */}
          <div className="flex flex-row sm:flex-row items-center gap-2 w-full sm:w-auto mt-3 md:mt-0">
            <span className="text-xs sm:text-sm text-[#A6A6A6]">Show:</span>
            <CustomDropdown
              value={pagination.totalItems}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              options={[
                { value: 4, label: 4 },
                { value: 8, label: 8 },
                { value: 12, label: 12 },
                { value: 24, label: 24 },
                { value: 48, label: 48 },
              ]}
              placeholder={pagination.totalItems}
              className="text-xs sm:text-sm outline-none w-full sm:w-auto max-w-15"
            />
            <span className="text-xs sm:text-sm text-[#A6A6A6]">per page</span>
          </div>
        </div>


        {/* Brands Grid with loading overlay */}
        <div className="relative">
          {isPending && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <Loader className="animate-spin text-blue-600" size={32} />
            </div>
          )}

          {brands.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  <div className="relative overflow-hidden rounded-top-xl">
                    {/* Image / Brand Area */}
                    <div
                      className="h-40 w-full flex items-center justify-center
               bg-gradient-to-br from-black via-[#0b0b0b] to-black
               text-white font-extrabold text-4xl tracking-tight"
                    >
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.brandName}
                          className="max-h-16 object-contain"
                        />
                      ) : (
                        brand.brandName || "Brand"
                      )}
                    </div>

                    {/* ACTIVE Badge (Top Left) */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1
    rounded-full border text-xs font-semibold
    flex items-center gap-1.5
    ${brand.isActive
                          ? "border-[#10B981] text-[#10B981] bg-[rgba(16,185,129,0.10)]"
                          : "border-red-500 text-red-500 bg-red-100"
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${brand.isActive ? "bg-[#10B981]" : "bg-red-500"
                          }`}
                      />
                      {brand.isActive ? "ACTIVE" : "INACTIVE"}
                    </div>

                    {/* FEATURED Badge (Top Right) */}
                    {brand.isFeature && (
                      <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-full
                    bg-[#FF8A1F] text-white text-xs font-semibold
                    flex items-center gap-1 shadow-md"
                      >
                        <Star size={12} fill="currentColor" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className=" font-poppins  text-[22px]   leading-[24px]  font-semibold  text-[#1A1A1A]  mb-1  truncate  transition-colors">
                      {brand.brandName}
                    </h3>

                    {/* <p
                                            className=" font-inter  text-[14px]  leading-[20px]  font-normal  text-[#4A4A4A]  mb-3  line-clamp-1"
                                        >
                                            {brand.tagline}
                                        </p> */}

                    <p className="mt-2 font-inter    text-[14px]  leading-[20px]  font-normal  text-[#4A4A4A]  mb-3  line-clamp-1">
                      {brand.description}
                    </p>

                    {/* Category */}
                    <div className="mt-3 mb-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold leading-[20px] text-[#364152] border ${getCategoryColor(
                          brand.categoryName
                        )}`}
                      >
                        {brand.categoryName || "Uncategorized"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 mt-auto pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleReviewClick(brand)}
                        disabled={actionLoading}
                        title="Review Brand"
                        className="text-[#1F59EE] bg-[#E2EAFF] hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="11"
                          viewBox="0 0 13 11"
                          fill="none"
                        >
                          <path
                            d="M6.3105 0C9.45583 0 12.0727 2.26333 12.6216 5.25C12.0732 8.23667 9.45583 10.5 6.3105 10.5C3.16517 10.5 0.548333 8.23667 0 5.25C0.548333 2.26333 3.16517 0 6.3105 0ZM6.3105 9.33333C7.50029 9.33321 8.65479 8.92917 9.58502 8.18736C10.5152 7.44555 11.1661 6.40992 11.431 5.25C11.1654 4.09081 10.5143 3.05606 9.58417 2.31498C8.65407 1.57391 7.50003 1.17037 6.31079 1.17037C5.12156 1.17037 3.96752 1.57391 3.03742 2.31498C2.10732 3.05606 1.45621 4.09081 1.19058 5.25C1.45547 6.40983 2.10623 7.44538 3.03633 8.18718C3.96644 8.92898 5.12081 9.33308 6.3105 9.33333ZM6.3105 7.875C5.61431 7.875 4.94663 7.59844 4.45434 7.10615C3.96206 6.61387 3.6855 5.94619 3.6855 5.25C3.6855 4.55381 3.96206 3.88613 4.45434 3.39384C4.94663 2.90156 5.61431 2.625 6.3105 2.625C7.00669 2.625 7.67437 2.90156 8.16665 3.39384C8.65894 3.88613 8.9355 4.55381 8.9355 5.25C8.9355 5.94619 8.65894 6.61387 8.16665 7.10615C7.67437 7.59844 7.00669 7.875 6.3105 7.875ZM6.3105 6.70833C6.69727 6.70833 7.06821 6.55469 7.3417 6.2812C7.61519 6.00771 7.76883 5.63677 7.76883 5.25C7.76883 4.86323 7.61519 4.49229 7.3417 4.2188C7.06821 3.94531 6.69727 3.79167 6.3105 3.79167C5.92373 3.79167 5.55279 3.94531 5.2793 4.2188C5.00581 4.49229 4.85217 4.86323 4.85217 5.25C4.85217 5.63677 5.00581 6.00771 5.2793 6.2812C5.55279 6.55469 5.92373 6.70833 6.3105 6.70833Z"
                            fill="#1F59EE"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => redirectToSettlement(brand.id)}
                        disabled={actionLoading}
                        title={
                          brand.isFeature ? "Unfeature Brand" : "Feature Brand"
                        }
                        className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 bg-[#E5E5E5] text-[#4A4A4A] hover:bg-orange-200`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 12 14"
                          fill="none"
                        >
                          <path
                            d="M11.4809 3.56317V12.6533C11.4809 13.3958 10.8767 14 10.1342 14H3.98994C3.24739 14 2.64326 13.3958 2.64326 12.6533V6.74272C2.83535 6.77468 3.03132 6.7954 3.23243 6.7954C3.37505 6.7954 3.51503 6.7848 3.65328 6.76845V12.6533C3.65328 12.8389 3.80427 12.99 3.98994 12.99H10.1342C10.3198 12.99 10.4708 12.8389 10.4708 12.6533V3.56317C10.4708 3.37749 10.3198 3.2265 10.1342 3.2265H6.80135C6.80135 2.87538 6.74859 2.53696 6.65403 2.21651H10.1342C10.8767 2.21648 11.4809 2.82061 11.4809 3.56317ZM3.17619 6.3523C1.42478 6.3523 0 4.92752 0 3.17619C2.7812e-05 1.42478 1.42478 0 3.17619 0C4.92754 0 6.35238 1.42478 6.35238 3.17619C6.35238 4.92752 4.92754 6.3523 3.17619 6.3523ZM3.17619 5.67894C4.55617 5.67894 5.67897 4.55634 5.67897 3.17619C5.67897 1.79596 4.55634 0.673357 3.17619 0.673357C1.79599 0.673357 0.673357 1.79596 0.673357 3.17619C0.673357 4.55634 1.79616 5.67894 3.17619 5.67894ZM5.08107 3.51288C5.26691 3.51288 5.41773 3.36206 5.41773 3.17622C5.41773 2.99038 5.26691 2.83955 5.08107 2.83955H3.51286V1.51793C3.51286 1.33209 3.36203 1.18126 3.17619 1.18126C2.99035 1.18126 2.83953 1.33209 2.83953 1.51793V3.17622C2.83953 3.36206 2.99035 3.51288 3.17619 3.51288H5.08107ZM8.96685 6.24258H5.31958C5.13374 6.24258 4.98292 6.39341 4.98292 6.57925C4.98292 6.76511 5.13374 6.91591 5.31958 6.91591H8.96685C9.15278 6.91591 9.30352 6.76509 9.30352 6.57925C9.30355 6.39341 9.15278 6.24258 8.96685 6.24258ZM8.97278 8.28479H5.32551C5.13967 8.28479 4.98884 8.43553 4.98884 8.62146C4.98884 8.80738 5.13967 8.95812 5.32551 8.95812H8.97278C9.1587 8.95812 9.30941 8.80738 9.30941 8.62146C9.30941 8.43553 9.15887 8.28479 8.97278 8.28479ZM8.97278 10.4115H5.32551C5.13967 10.4115 4.98884 10.5624 4.98884 10.7482C4.98884 10.9341 5.13967 11.0848 5.32551 11.0848H8.97278C9.1587 11.0848 9.30941 10.9341 9.30941 10.7482C9.30944 10.5624 9.15887 10.4115 8.97278 10.4115Z"
                            fill="#4A4A4A"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => toggleFeatured(brand.id)}
                        disabled={actionLoading}
                        title={
                          brand.isFeature ? "Unfeature Brand" : "Feature Brand"
                        }
                        className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${brand.isFeature
                            ? "text-orange-500 bg-orange-100 hover:bg-orange-200"
                            : "text-gray-400 hover:bg-gray-100 hover:text-orange-500"
                          }`}
                      >
                        <Star
                          size={16}
                          fill={brand.isFeature ? "currentColor" : "none"}
                        />
                      </button>
                      <button
                        onClick={() => toggleActive(brand.id)}
                        disabled={actionLoading}
                        title={
                          brand.isActive ? "Deactivate Brand" : "Activate Brand"
                        }
                        className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${brand.isActive
                            ? "text-green-500 bg-green-100 hover:bg-green-200"
                            : "text-gray-400 hover:bg-gray-100 hover:text-green-500"
                          }`}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => handleEditClick(brand)}
                        disabled={actionLoading}
                        title="Edit Brand"
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        disabled={actionLoading}
                        title="Delete Brand"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">
                No Brands Found
              </h3>
              <p className="text-gray-500 mt-2">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Add a new brand to get started"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}
              </span>{" "}
              of <span className="font-semibold">{pagination.totalItems}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || isPending}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="text-sm text-gray-700 px-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || isPending}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandManager;
