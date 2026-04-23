export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "product";

export const getProductPath = (product = null) => {
  if (!product) return "/product";

  const productId =
    typeof product === "string"
      ? product
      : product._id || product.id || product.productId || "";

  if (!productId) return "/product";

  const productName =
    typeof product === "string"
      ? "product"
      : product.name || product.title || "product";

  return `/product/${slugify(productName)}/${productId}`;
};
