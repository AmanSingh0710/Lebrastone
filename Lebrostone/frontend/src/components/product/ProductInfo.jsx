import React, { useMemo } from "react";
import { Loader2, Plus } from "lucide-react";

const UNIT_GROUP = {
  weight: ["kg", "g", "gm", "mg"],
  volume: ["l", "ml"],
  count: ["pc", "pcs", "piece", "pieces", "tablet", "tablets", "capsule", "capsules"],
};

const formatAmount = (value) => {
  const num = Number(value) || 0;
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(2).replace(/\.00$/, "");
};

const parseUnitFromText = (text) => {
  if (!text) return null;
  const match = String(text)
    .toLowerCase()
    .match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|mg|l|ml|pcs?|piece|pieces|tablets?|capsules?|pc)\b/i);
  if (!match) return null;
  return { value: Number(match[1]), unit: match[2].toLowerCase() };
};

const normalizeUnit = (rawUnit = "") => {
  const unit = String(rawUnit).toLowerCase().trim();
  if (UNIT_GROUP.weight.includes(unit)) return unit === "gm" ? "g" : unit;
  if (UNIT_GROUP.volume.includes(unit)) return unit;
  if (UNIT_GROUP.count.includes(unit)) return "pc";
  return "";
};

const toBaseMeasure = (value, unit) => {
  const numericValue = Number(value) || 0;
  if (!numericValue || !unit) return null;

  if (unit === "kg") return { amount: numericValue * 1000, type: "weight" };
  if (unit === "g") return { amount: numericValue, type: "weight" };
  if (unit === "mg") return { amount: numericValue / 1000, type: "weight" };
  if (unit === "l") return { amount: numericValue * 1000, type: "volume" };
  if (unit === "ml") return { amount: numericValue, type: "volume" };
  if (unit === "pc") return { amount: numericValue, type: "count" };

  return null;
};

const getVariantUnitPrice = (variant, product) => {
  const sellingPrice = Number(variant?.selling_price || variant?.price) || 0;
  if (!sellingPrice) return "";

  const directUnit = normalizeUnit(variant?.unitMeasure);
  let unitInfo = null;

  if (directUnit && Number(variant?.unitValue) > 0) {
    unitInfo = { value: Number(variant.unitValue), unit: directUnit };
  } else {
    unitInfo =
      parseUnitFromText(variant?.weight) ||
      parseUnitFromText(variant?.size) ||
      (product?.quantity?.value && product?.quantity?.unit
        ? {
            value: Number(product.quantity.value),
            unit: normalizeUnit(product.quantity.unit),
          }
        : null);
  }

  if (!unitInfo?.value || !unitInfo?.unit) return "";

  const normalized = toBaseMeasure(unitInfo.value, unitInfo.unit);
  if (!normalized?.amount) return "";

  if (normalized.type === "weight") {
    const pricePer100G = (sellingPrice * 100) / normalized.amount;
    return `(₹${formatAmount(pricePer100G)} / 100 g)`;
  }

  if (normalized.type === "volume") {
    const pricePer100Ml = (sellingPrice * 100) / normalized.amount;
    return `(₹${formatAmount(pricePer100Ml)} / 100 ml)`;
  }

  const pricePerPiece = sellingPrice / normalized.amount;
  return `(₹${formatAmount(pricePerPiece)} / 1 pc)`;
};

const getVariantPrimaryLabel = (variant, productName = "") => {
  const size = String(variant?.size || "").trim();
  const weight = String(variant?.weight || "").trim();
  const title = String(variant?.title || "").trim();
  const normalizedProductName = String(productName || "").trim().toLowerCase();

  if (size) return size;
  if (weight) return weight;
  if (title && title.toLowerCase() !== normalizedProductName) return title;
  return "Standard Pack";
};

const getVariantMetaLabel = (variant, productName = "") => {
  const normalizedProductName = String(productName || "").trim().toLowerCase();
  const parts = [variant?.size, variant?.weight, variant?.title]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .filter((part) => part.toLowerCase() !== normalizedProductName);
  const uniqueParts = [...new Set(parts)];

  if (uniqueParts.length <= 1) return "";
  return uniqueParts.join(" • ");
};

const ProductInfo = ({
  product,
  selectedVariant,
  onSelectVariant,
  variantSwitching = false,
}) => {
  if (!product) {
    return (
      <div className="p-4 text-gray-500 font-bold animate-pulse">
        Syncing Product Data...
      </div>
    );
  }

  const variants = useMemo(() => {
    const rootSP = Number(product.selling_price) || 0;
    const rootMRP = Number(product.mrp) || 0;

    const normalizedVariants = (product.variants || [])
      .map((variant, idx) => ({
        ...variant,
        _id: variant._id || variant.sku || `${product._id}-variant-${idx}`,
        size: variant.size || variant.title || "Standard",
        title: variant.title || product.name,
        is_combo: product.is_combo || false,
      }))
      .filter((variant) => Number(variant.selling_price || variant.price) > 0);

    if (normalizedVariants.length > 0) return normalizedVariants;

    if (rootSP > 0) {
      return [
        {
          _id: `${product._id}-root`,
          size: product.is_combo ? "Standard Pack" : "Standard",
          title: product.name,
          weight:
            product.quantity?.value && product.quantity?.unit
              ? `${product.quantity.value} ${product.quantity.unit}`
              : "",
          selling_price: rootSP,
          mrp: rootMRP > 0 ? rootMRP : rootSP,
          is_combo: product.is_combo,
        },
      ];
    }

    if (product.is_combo && product.included_products?.length > 0) {
      let finalSP = 0;
      let finalMRP = 0;

      product.included_products.forEach((item) => {
        if (item && typeof item === "object") {
          const itemSP =
            Number(item.selling_price) || Number(item.variants?.[0]?.selling_price) || 0;
          const itemMRP = Number(item.mrp) || Number(item.variants?.[0]?.mrp) || 0;
          finalSP += itemSP;
          finalMRP += itemMRP || itemSP;
        }
      });

      return [
        {
          _id: "combo-calc",
          size: "Combo Bundle",
          title: product.name,
          selling_price: finalSP,
          mrp: finalMRP,
          is_combo: true,
        },
      ];
    }

    return [
      {
        _id: "fallback",
        size: "Standard",
        title: product.name,
        selling_price: 0,
        mrp: 0,
        is_combo: false,
      },
    ];
  }, [product]);

  const activeVariant = selectedVariant || variants[0];
  const displayWeight =
    activeVariant?.weight ||
    (product.quantity?.value ? `${product.quantity.value} ${product.quantity.unit}` : "");
  const displayName = activeVariant?.title || product.name;

  return (
    <div className="flex flex-col font-sans text-[#212121]">
      <div className="mb-6">
        <h1 className="text-[24px] md:text-[28px] font-extrabold leading-tight mb-1 text-slate-900">
          {displayWeight ? `${displayName} - ${displayWeight}` : displayName}
        </h1>

        <p className="text-[14px] text-[#9f834f] font-semibold italic mb-4 uppercase tracking-wide">
          {product.tagline ||
            (activeVariant?.is_combo ? "Value Pack Bundle" : "Premium Natural Care")}
        </p>

        <div className="flex items-center gap-3 bg-[#f7f9fc] p-4 rounded-2xl border border-slate-200 transition-all duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {activeVariant?.is_combo
                ? "Total Combo Value"
                : `Selected: ${activeVariant?.size || "Standard"}`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">
                ₹{formatAmount(activeVariant?.selling_price || activeVariant?.price || 0)}
              </span>
              {Number(activeVariant?.mrp) >
                Number(activeVariant?.selling_price || activeVariant?.price || 0) && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    ₹{formatAmount(activeVariant?.mrp)}
                  </span>
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                    SAVE ₹
                    {formatAmount(
                      (activeVariant?.mrp || 0) -
                        (activeVariant?.selling_price || activeVariant?.price || 0),
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        {activeVariant?.is_combo ? (
          <div className="space-y-4">
            <span className="block font-black text-[12px] text-emerald-600 uppercase tracking-[0.2em] italic">
              Items in this Combo
            </span>
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex items-center justify-around gap-4 shadow-sm">
              {product.included_products?.map((item, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center text-center gap-2 group">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 p-2 overflow-hidden">
                      <img
                        src={item?.images?.[0] || "https://via.placeholder.com/150"}
                        className="w-full h-full object-contain"
                        alt="item"
                      />
                    </div>
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-tighter max-w-[70px] leading-tight">
                      {item?.name || "Product Item"}
                    </span>
                  </div>
                  {idx < product.included_products.length - 1 && (
                    <Plus size={16} className="text-slate-300 font-bold" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative">
            <span className="block font-black text-[24px] md:text-[28px] mb-4 text-gray-900 tracking-tight text-center md:text-left">
              Select Size
            </span>

            {variantSwitching && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                <Loader2 className="animate-spin text-[#00AFEF]" size={22} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {variants.map((variant, idx) => {
                const sellingPrice = Number(variant.selling_price || variant.price) || 0;
                const mrp = Number(variant.mrp) || 0;
                const hasDiscount = mrp > sellingPrice && sellingPrice > 0;
                const discountPercent = hasDiscount
                  ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                  : 0;
                const isOutOfStock = variant.isAvailable === false;
                const stockLabel = isOutOfStock ? "Out of stock" : "In stock";
                const stockClass =
                  isOutOfStock ? "text-red-500" : "text-emerald-600";
                const unitPriceText = getVariantUnitPrice(variant, product);
                const primaryLabel = getVariantPrimaryLabel(variant, product?.name);
                const variantMetaLabel = getVariantMetaLabel(variant, product?.name);

                return (
                <button
                  key={variant._id || idx}
                  type="button"
                  disabled={variantSwitching || isOutOfStock}
                  onClick={() => onSelectVariant?.(variant)}
                  className={`relative border rounded-2xl p-4 transition-all flex flex-col min-h-[144px] text-left ${
                    activeVariant?._id === variant._id
                      ? "border-[#00AFEF] bg-[#f8fcff] shadow-[0_8px_20px_rgba(0,175,239,0.12)]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  } ${
                    variantSwitching
                      ? "cursor-wait"
                      : isOutOfStock
                        ? "cursor-not-allowed opacity-70"
                        : "cursor-pointer"
                  }`}
                >
                  <div className="font-semibold text-[16px] text-slate-900 mb-1 leading-snug">
                    {primaryLabel}
                  </div>
                  {variantMetaLabel && (
                    <div className="text-[11px] text-slate-500 mb-2 font-medium line-clamp-2">
                      {variantMetaLabel}
                    </div>
                  )}
                  <div className="font-extrabold text-[30px] text-slate-900 leading-none mb-2">
                    ₹{formatAmount(sellingPrice)}
                  </div>
                  <div className="text-[12px] text-slate-600 mb-1">
                    M.R.P:
                    <span className="line-through ml-1 text-slate-400">
                      ₹{formatAmount(mrp || sellingPrice)}
                    </span>
                    {discountPercent > 0 && (
                      <span className="ml-2 text-[#ff5a5a] font-bold">
                        {discountPercent}% off
                      </span>
                    )}
                  </div>
                  {unitPriceText && (
                    <div className="text-[12px] text-slate-700 font-medium mb-2">
                      {unitPriceText}
                    </div>
                  )}
                  <div className={`text-[15px] font-medium mt-auto ${stockClass}`}>
                    {stockLabel}
                  </div>
                </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
