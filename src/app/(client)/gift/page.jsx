"use client";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import StepRenderer from "../../../components/client/giftflow/StepRenderer";
import Header from "../../../components/client/home/Header";
import Footer from "../../../components/client/home/Footer";
import { useEffect, Suspense, useState, useCallback, useTransition, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setCurrentStep } from "../../../redux/giftFlowSlice";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getBrandsForClient } from "../../../lib/action/brandFetch";

const PageContent = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  });

  // Use transition for smoother updates
  const [isPending, startTransition] = useTransition();

  // Memoize URL parameters
  const urlParams = useMemo(() => ({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "All Categories",
    page: parseInt(searchParams.get("page")) || 1,
    sort: searchParams.get("sort") || "",
    mode: searchParams.get("mode") || "",
  }), [searchParams]);

  // Cache for prefetched data
  const [prefetchCache, setPrefetchCache] = useState(new Map());

  // Fetch brands data with caching
  const fetchBrands = useCallback(async (params, useCache = true) => {
    const cacheKey = JSON.stringify(params);

    // Check cache first
    if (useCache && prefetchCache.has(cacheKey)) {
      const cachedData = prefetchCache.get(cacheKey);
      setBrands(cachedData.data || []);
      setPagination(cachedData.pagination || {
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getBrandsForClient({
        page: params.page,
        searchTerm: params.search,
        category: params.category === "All Categories" ? "" : params.category,
        sortBy: params.sort,
      });

      if (data.success) {
        setBrands(data.data || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          hasMore: data.pagination?.hasMore || false,
        });

        // Update cache
        setPrefetchCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, {
            data: data.data,
            pagination: data.pagination,
            timestamp: Date.now(),
          });
          // Keep cache size limited (max 10 entries)
          if (newCache.size > 10) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
          }
          return newCache;
        });
      } else {
        setError(data.message || "Failed to fetch brands");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [prefetchCache]);

  // Prefetch adjacent pages
  const prefetchAdjacentPages = useCallback((currentParams) => {
    const { page, ...otherParams } = currentParams;
    
    // Prefetch next page
    if (pagination.hasMore) {
      const nextPageParams = { ...otherParams, page: page + 1 };
      const nextCacheKey = JSON.stringify(nextPageParams);
      
      if (!prefetchCache.has(nextCacheKey)) {
        getBrandsForClient({
          page: nextPageParams.page,
          searchTerm: nextPageParams.search,
          category: nextPageParams.category === "All Categories" ? "" : nextPageParams.category,
          sortBy: nextPageParams.sort,
        }).then((data) => {
          if (data.success) {
            setPrefetchCache((prev) => {
              const newCache = new Map(prev);
              newCache.set(nextCacheKey, {
                data: data.data,
                pagination: data.pagination,
                timestamp: Date.now(),
              });
              return newCache;
            });
          }
        });
      }
    }

    // Prefetch previous page
    if (page > 1) {
      const prevPageParams = { ...otherParams, page: page - 1 };
      const prevCacheKey = JSON.stringify(prevPageParams);
      
      if (!prefetchCache.has(prevCacheKey)) {
        getBrandsForClient({
          page: prevPageParams.page,
          searchTerm: prevPageParams.search,
          category: prevPageParams.category === "All Categories" ? "" : prevPageParams.category,
          sortBy: prevPageParams.sort,
        }).then((data) => {
          if (data.success) {
            setPrefetchCache((prev) => {
              const newCache = new Map(prev);
              newCache.set(prevCacheKey, {
                data: data.data,
                pagination: data.pagination,
                timestamp: Date.now(),
              });
              return newCache;
            });
          }
        });
      }
    }
  }, [pagination.hasMore, prefetchCache]);

  // Fetch brands when URL parameters change
  useEffect(() => {
    fetchBrands(urlParams);
  }, [urlParams, fetchBrands]);

  // Prefetch adjacent pages after successful load
  useEffect(() => {
    if (!loading && brands.length > 0) {
      prefetchAdjacentPages(urlParams);
    }
  }, [loading, brands, urlParams, prefetchAdjacentPages]);

  // Set current step on mount
  useEffect(() => {
    dispatch(setCurrentStep(1));
  }, [dispatch]);

  // Update URL parameters with transition
  const updateUrlParams = useCallback((updates) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "All Categories") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Preserve mode parameter
      if (urlParams.mode) {
        params.set("mode", urlParams.mode);
      }

      // Reset to page 1 when filters change (except when explicitly changing page)
      if (!updates.page && (updates.search !== undefined || updates.category !== undefined || updates.sort !== undefined)) {
        params.delete("page");
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${pathname}${newUrl}`, { scroll: false });
    });
  }, [searchParams, urlParams.mode, router, pathname]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    startTransition(() => {
      const newUrl = urlParams.mode ? `?mode=${urlParams.mode}` : "";
      router.replace(`${pathname}${newUrl}`, { scroll: false });
    });
  }, [urlParams.mode, router, pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading...</div>
        </div>
      }>
        <StepRenderer
          brands={brands}
          loading={loading || isPending}
          error={error}
          pagination={pagination}
          searchTerm={urlParams.search}
          selectedCategory={urlParams.category}
          currentPage={urlParams.page}
          sortBy={urlParams.sort}
          updateUrlParams={updateUrlParams}
          clearFilters={clearFilters}
        />
      </Suspense>
      <Footer />
    </div>
  );
};

const Page = () => {
  return (
    <Provider store={store}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Loading page...</div>
        </div>
      }>
        <PageContent />
      </Suspense>
    </Provider>
  );
};

export default Page;