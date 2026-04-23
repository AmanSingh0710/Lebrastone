import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "./api/AxiosConfig";
import { Plus, Minus, Loader2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getProductPath } from "../../utils/productRoutes";
import SeoMeta from "../common/SeoMeta";
import "swiper/css";
import "swiper/css/navigation";

// Components
import ProductGallery from "../product/ProductGallery";
import ProductInfo from "../product/ProductInfo";
import ProductSidebar from "../product/ProductSidebar";
import Reviews from "../product/Reviews";
import { useRef } from "react";

const ProductDetail = () => {
  const { id, slug } = useParams();
  const productId = id || slug;
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantSwitching, setVariantSwitching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Product Description");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const swiperRef = useRef(null);
  const variantTimerRef = useRef(null);

  const getCleanUrl = (img) => {
    if (!img) return "";
    return getImageUrl(img);
  };

  const parseMeasureFromText = (text = "") => {
    const match = String(text)
      .toLowerCase()
      .match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|mg|ml|l|ltr|lt|pcs?|pc|pack)\b/i);
    if (!match) return "";
    const unitMap = { gm: "g", ltr: "L", lt: "L" };
    const value = match[1];
    const unit = unitMap[match[2].toLowerCase()] || match[2];
    return `${value}${String(unit).toUpperCase() === "L" ? "L" : String(unit).toLowerCase()}`;
  };

  const getProductBaseMeasureLabel = (productData = null) => {
    const qtyValue = Number(productData?.quantity?.value) || 0;
    const qtyUnit = String(productData?.quantity?.unit || "").trim();
    if (qtyValue > 0 && qtyUnit) {
      const unitMap = { gm: "g", ltr: "L", lt: "L" };
      const normalizedUnit = unitMap[qtyUnit.toLowerCase()] || qtyUnit;
      return `${qtyValue}${String(normalizedUnit).toUpperCase() === "L" ? "L" : String(normalizedUnit).toLowerCase()}`;
    }

    return (
      parseMeasureFromText(productData?.sku || "") ||
      parseMeasureFromText(productData?.name || "") ||
      ""
    );
  };

  const getVariantSizeLabel = (variant = {}, productData = null) => {
    const size = String(variant.size || "").trim();
    const weight = String(variant.weight || "").trim();
    const title = String(variant.title || "").trim();
    const productBaseMeasure = getProductBaseMeasureLabel(productData);

    if (size) return size;
    if (weight) return weight;
    if (title && title.toLowerCase() !== String(productData?.name || "").toLowerCase()) {
      return title;
    }

    if (productBaseMeasure) return productBaseMeasure;

    return "Standard Pack";
  };

  const normalizeVariant = (variant, productId, fallbackImages, productData = null) => {
    const variantImages =
      Array.isArray(variant.images) && variant.images.length > 0
        ? variant.images.map(getCleanUrl)
        : variant.thumbnail
          ? [getCleanUrl(variant.thumbnail)]
          : fallbackImages;
    return {
      ...variant,
      _id:
        variant._id ||
        variant.sku ||
        `${productId}-v-${Math.random().toString(36).slice(2, 8)}`,
      size: getVariantSizeLabel(variant, productData),
      title: variant.title || "",
      weight: variant.weight || "",
      images: variantImages,
      thumbnail: variant.thumbnail ? getCleanUrl(variant.thumbnail) : "",
    };
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await instance.get(`/api/products/${productId}`);
        const data = res.data.data;

        // --- IMAGE LOGIC ---
        const finalImages =
          data.images && data.images.length > 0
            ? data.images.map(getCleanUrl)
            : [getCleanUrl(data.thumbnail)];

        // --- PRICE & VARIANT MAPPING ---
        const baseMeasureLabel = getProductBaseMeasureLabel(data);
        const baseVariant = {
          _id: `${data._id}-default`,
          title: data.name,
          size: data.is_combo
            ? "Standard Pack"
            : baseMeasureLabel || "Standard Pack",
          weight: baseMeasureLabel || "",
          price: data.unitPrice,
          selling_price: data.selling_price || data.unitPrice,
          mrp: data.mrp || data.unitPrice + (data.discountAmount || 0),
          discountAmount: data.discountAmount || 0,
          discountType: data.discountType || "Percent",
          thumbnail: getCleanUrl(data.thumbnail),
          images: finalImages,
          discount:
            data.discountType === "Percent"
              ? `${data.discountAmount}% Off`
              : `₹${data.discountAmount} Off`,
          usp: `₹${(data.unitPrice / 1).toFixed(2)} / ${data.unit || "unit"}`,
        };

        const apiVariantsFromDb =
          data.variants && data.variants.length > 0
            ? data.variants
                .map((v) => normalizeVariant(v, data._id, finalImages, data))
                .filter(
                  (variant) =>
                    Number(variant.selling_price || variant.price || variant.mrp) > 0,
                )
            : [];
        const basePriceValue =
          Number(baseVariant.selling_price || baseVariant.price || baseVariant.mrp) || 0;
        const dbVariantIdentity = new Set(
          apiVariantsFromDb.map((variant) =>
            [
              String(variant.size || "").trim().toLowerCase(),
              String(variant.weight || "").trim().toLowerCase(),
              Number(variant.selling_price || variant.price || 0),
              Number(variant.mrp || 0),
            ].join("|"),
          ),
        );
        const baseIdentity = [
          String(baseVariant.size || "").trim().toLowerCase(),
          String(baseVariant.weight || "").trim().toLowerCase(),
          Number(baseVariant.selling_price || baseVariant.price || 0),
          Number(baseVariant.mrp || 0),
        ].join("|");
        const shouldIncludeBaseVariant =
          basePriceValue > 0 && !dbVariantIdentity.has(baseIdentity);
        const apiVariants = shouldIncludeBaseVariant
          ? [baseVariant, ...apiVariantsFromDb]
          : apiVariantsFromDb.length > 0
            ? apiVariantsFromDb
            : [baseVariant];

        const formattedProduct = {
          ...data,
          images: finalImages,
          featureImages: (data.featureImages || []).map((fi) =>
            getCleanUrl(fi.url || fi),
          ),
          categoryName: data.category?.name || "Product",
          brandName: data.brand?.name || "LEBROSTONE",
          subtitle: data.sku || "Premium Quality",
          rating: 5.0,
          reviewsCount: 270,
          variants: apiVariants,
          long_description: data.description,
          howToUse: data.howToUse || "",
          ingredientsList: data.ingredients || [],
          faqs: [],
          reviewsList: [],
        };

        setProduct(formattedProduct);
        const defaultVariant =
          formattedProduct.variants.find((v) => v.isAvailable !== false) ||
          formattedProduct.variants[0];
        setSelectedVariant(defaultVariant);

        const canonicalPath = getProductPath(data);
        if (window.location.pathname !== canonicalPath) {
          navigate(canonicalPath, { replace: true });
        }

        // Fetch product features (howToUse, ingredients)
        fetchProductFeatures(data._id, formattedProduct);

        // Fetch suggested products (same category or random)
        fetchSuggestedProducts(data.category?._id, data._id);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setLoading(false);
      }
    };

    const fetchProductFeatures = async (productId, formattedProduct) => {
      try {
        const res = await instance.get(`/api/features/${productId}`);
        const featureData = res.data;
        setProduct((prev) => ({
          ...prev,
          howToUse: featureData.howToUse || "",
          ingredientsList: featureData.ingredients || [],
          featuresList: featureData.features || [],
        }));
      } catch (err) {
        console.error("Error fetching product features:", err);
      }
    };

    const fetchSuggestedProducts = async (categoryId, currentProductId) => {
      try {
        const res = await instance.get("/api/products");
        let products = res.data.data || [];
        // Filter out current product and take 8 random products
        products = products
          .filter((p) => p._id !== currentProductId)
          .slice(0, 8);
        setSuggestedProducts(products);
      } catch (err) {
        console.error("Error fetching suggested products:", err);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [productId, navigate]);

  const handleVariantSelect = (variant) => {
    if (!variant || selectedVariant?._id === variant._id) return;
    if (variantTimerRef.current) clearTimeout(variantTimerRef.current);
    setVariantSwitching(true);
    variantTimerRef.current = setTimeout(() => {
      setSelectedVariant(variant);
      setVariantSwitching(false);
      variantTimerRef.current = null;
    }, 350);
  };

  useEffect(() => {
    return () => {
      if (variantTimerRef.current) clearTimeout(variantTimerRef.current);
    };
  }, []);

  const toggleFaq = (index) =>
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  const createMarkup = (html) => {
    if (!html) return { __html: "" };
    // Replace &nbsp; with regular spaces so text wraps properly
    const cleanHtml = html.replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ");
    return { __html: cleanHtml };
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#00AFEF]" size={48} />
      </div>
    );

  if (!product)
    return <div className="text-center py-20">Product not found!</div>;

  const activeVariant = selectedVariant || product.variants?.[0] || null;
  const displayImages =
    activeVariant?.images && activeVariant.images.length > 0
      ? activeVariant.images
      : product.images;
  const displayProduct = {
    ...product,
    name: activeVariant?.title || product.name,
    images: displayImages,
  };
  const seoDescriptionSource =
    product.shortDescription ||
    product.long_description ||
    product.description ||
    `${displayProduct.name} by LEBROSTONE`;
  const seoDescription = String(seoDescriptionSource)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const seoImage =
    getCleanUrl(product.thumbnail || displayImages?.[0] || product.images?.[0]) ||
    "/banner-ls.jpg";

  const tabs = ["Product Description", "How to Use", "Key Ingredients"];

  return (
    <>
      <SeoMeta
        title={`${displayProduct.name} | LEBROSTONE`}
        description={seoDescription}
        image={seoImage}
        keywords={`${displayProduct.name}, ${product.categoryName}, LEBROSTONE`}
        type="product"
      />
      <div className="font-sans text-[#212121] bg-white">
        {/* Breadcrumbs */}
        <div className="hidden md:flex max-w-[1280px] mx-auto px-4 py-3 text-[13px] text-gray-500 items-center gap-2">
          <a href="/" className="hover:text-[#00AFEF]">
            Home
          </a>
          <span>›</span>
          <span className="capitalize">{product.categoryName}</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">{displayProduct.name}</span>
        </div>

        <main className="max-w-[1280px] mx-auto px-4 py-4 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          <div className="lg:col-span-9">
            <div className="flex flex-col lg:flex-row gap-8 mb-10">
              <div className="w-full lg:w-[55%]">
                <ProductGallery
                  images={displayImages}
                  loading={variantSwitching}
                />
              </div>
              <div className="w-full lg:w-[45%]">
                <ProductInfo
                  product={displayProduct}
                  selectedVariant={selectedVariant}
                  onSelectVariant={handleVariantSelect}
                  variantSwitching={variantSwitching}
                />
              </div>
            </div>

            {/* Sidebar for mobile - positioned after product info */}
            <div className="lg:hidden mb-10">
              <ProductSidebar
                product={displayProduct}
                selectedVariant={selectedVariant}
                quantity={quantity}
                setQuantity={setQuantity}
              />
            </div>

            {/* Tab Section */}
            <div className="mb-12">
              <div className="flex border border-gray-200 rounded-md overflow-x-auto mb-8 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-[150px] py-4 text-[15px] font-medium transition-all text-center border-r border-gray-200 last:border-r-0 ${
                      activeTab === tab
                        ? "bg-blue-50 text-[#00AFEF] border-b-2 border-b-[#00AFEF]"
                        : "bg-white text-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="min-h-[250px] py-4">
                {activeTab === "Product Description" && (
                  <div className="space-y-8 animate-in fade-in duration-300 overflow-hidden">
                    {/* Text Description */}
                    <div
                      className="max-w-none text-gray-600 leading-relaxed text-base
                        [&_p]:mb-4 [&_strong]:text-gray-800 [&_em]:text-gray-700
                        [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                        [&_li]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                        [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2"
                      style={{
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                      dangerouslySetInnerHTML={createMarkup(
                        product.long_description,
                      )}
                    />

                    {/* --- Visual Images Section: prefer featureImages (description images) --- */}
                    {product.featureImages &&
                      product.featureImages.length > 0 && (
                        <div className="mt-10 space-y-4">
                          <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-[#00AFEF] pl-4">
                            About {displayProduct.name}
                          </h3>
                          <div className="flex flex-col gap-0 overflow-hidden rounded-xl shadow-sm border border-gray-100">
                            {product.featureImages.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`${displayProduct.name} detail ${idx + 1}`}
                                className="w-full h-auto object-cover"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* How to Use Tab */}
                {activeTab === "How to Use" && (
                  <div className="animate-in fade-in duration-300">
                    {product.howToUse ? (
                      <div
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed p-6 bg-slate-50 rounded-xl
                          [&_p]:mb-4 [&_strong]:text-gray-800
                          [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                          [&_li]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2"
                        dangerouslySetInnerHTML={createMarkup(product.howToUse)}
                      />
                    ) : (
                      <div className="p-8 bg-slate-50 rounded-xl text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-gray-500 font-medium">
                          Usage instructions for {displayProduct.name} will be
                          updated
                          soon.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Ingredients Tab */}
                {activeTab === "Key Ingredients" && (
                  <div className="animate-in fade-in duration-500">
                    {product.ingredientsList &&
                    product.ingredientsList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.ingredientsList.map((ingredient, idx) => (
                          <div
                            key={idx}
                            className="p-5 bg-[#F8FBFD] rounded-2xl border border-blue-100 flex items-center gap-4 hover:shadow-md transition-shadow"
                          >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-xl shrink-0">
                              🌿
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-gray-800">
                                {ingredient}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 bg-slate-50 rounded-xl text-center">
                        <div className="text-4xl mb-3">🧪</div>
                        <p className="text-gray-500 font-medium">
                          Ingredient details for {displayProduct.name} will be
                          updated
                          soon.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <Reviews
              reviews={product.reviewsList}
              overallRating={product.rating}
              totalReviews={product.reviewsCount}
            />
          </div>

          {/* Sidebar for desktop - positioned on right */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <ProductSidebar
                product={displayProduct}
                selectedVariant={selectedVariant}
                quantity={quantity}
                setQuantity={setQuantity}
              />
            </div>
          </div>
        </div>

        {/* Suggested Products Section */}
        {suggestedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-wider">
              You May Also Like
            </h2>

            <div className="relative px-4 md:px-12">
              {/* Navigation Buttons */}
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <FaChevronRight className="text-gray-600" />
              </button>

              <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                slidesPerView={2}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
                className="pb-4"
              >
                {suggestedProducts.map((item) => (
                  <SwiperSlide key={item._id}>
                    <div
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
                      onClick={() => navigate(getProductPath(item))}
                    >
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={getCleanUrl(
                            item.thumbnail || (item.images && item.images[0]),
                          )}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-gray-500 text-xs mb-2">
                          {item.category?.name || item.brand?.name || "Product"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[#00AFEF] font-bold">
                            ₹{item.unitPrice}
                          </span>
                          {item.discountAmount > 0 && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.unitPrice + item.discountAmount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
        </main>
      </div>
    </>
  );
};

export default ProductDetail;
