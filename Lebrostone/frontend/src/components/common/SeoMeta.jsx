import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "LEBROSTONE";
const DEFAULT_DESCRIPTION =
  "Shop premium skincare, wellness, and herbal products from LEBROSTONE. Discover trusted formulas crafted for daily care.";
const DEFAULT_IMAGE = "/banner-ls.jpg";
const DEFAULT_KEYWORDS =
  "LEBROSTONE, skincare, wellness, herbal products, ayurvedic products, beauty products";

const upsertMetaTag = (selector, attrs = {}, content = "") => {
  if (typeof document === "undefined") return;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) => {
      tag.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const upsertLinkTag = (rel, href) => {
  if (typeof document === "undefined") return;
  let tag = document.head.querySelector(`link[rel=\"${rel}\"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
};

const toAbsoluteUrl = (value, baseUrl) => {
  if (!value) return `${baseUrl}${DEFAULT_IMAGE}`;
  if (/^https?:\/\//i.test(value)) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${normalized}`;
};

const SeoMeta = ({
  title,
  description,
  image,
  keywords,
  type = "website",
  noIndex = false,
}) => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(
      /\/$/,
      "",
    );
    const finalTitle = title || DEFAULT_TITLE;
    const finalDescription = (description || DEFAULT_DESCRIPTION).trim();
    const finalKeywords = (keywords || DEFAULT_KEYWORDS).trim();
    const finalImage = toAbsoluteUrl(image || DEFAULT_IMAGE, siteUrl);
    const finalUrl = `${siteUrl}${location.pathname}${location.search}`;

    document.title = finalTitle;

    upsertMetaTag('meta[name="description"]', { name: "description" }, finalDescription);
    upsertMetaTag('meta[name="keywords"]', { name: "keywords" }, finalKeywords);
    upsertMetaTag(
      'meta[name="robots"]',
      { name: "robots" },
      noIndex ? "noindex, nofollow" : "index, follow",
    );

    upsertMetaTag('meta[property="og:type"]', { property: "og:type" }, type);
    upsertMetaTag('meta[property="og:site_name"]', { property: "og:site_name" }, "LEBROSTONE");
    upsertMetaTag('meta[property="og:title"]', { property: "og:title" }, finalTitle);
    upsertMetaTag(
      'meta[property="og:description"]',
      { property: "og:description" },
      finalDescription,
    );
    upsertMetaTag('meta[property="og:image"]', { property: "og:image" }, finalImage);
    upsertMetaTag('meta[property="og:url"]', { property: "og:url" }, finalUrl);

    upsertMetaTag('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, finalTitle);
    upsertMetaTag(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      finalDescription,
    );
    upsertMetaTag('meta[name="twitter:image"]', { name: "twitter:image" }, finalImage);

    upsertLinkTag("canonical", finalUrl);
  }, [title, description, image, keywords, type, noIndex, location.pathname, location.search]);

  return null;
};

export default SeoMeta;
