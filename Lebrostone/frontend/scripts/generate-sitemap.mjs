import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://lebrostone.com";
const API_BASE = "https://lebrostonebackend4.lifeinfotechinstitute.com";

const STATIC_ROUTES = [
  "/",
  "/shop",
  "/blogs",
  "/about-us",
  "/term-conditions",
  "/privacy-policy",
  "/return-policy",
  "/shipping-policy",
  "/cancellation-policy",
  "/refund-policy",
  "/collections/anantam",
];

const toIsoDate = (input) => {
  if (!input) return new Date().toISOString().slice(0, 10);
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const fetchJson = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
};

const addRoute = (map, route, lastmod, changefreq, priority) => {
  if (!route || typeof route !== "string") return;
  map.set(route, {
    route,
    lastmod: toIsoDate(lastmod),
    changefreq,
    priority,
  });
};

const buildSitemap = async () => {
  const urls = new Map();
  const today = new Date().toISOString().slice(0, 10);

  for (const route of STATIC_ROUTES) {
    const priority = route === "/" ? "1.0" : "0.7";
    const changefreq = route === "/" ? "daily" : "weekly";
    addRoute(urls, route, today, changefreq, priority);
  }

  const tasks = [
    fetchJson(`${API_BASE}/api/products`)
      .then((json) => {
        const items = Array.isArray(json?.data) ? json.data : [];
        for (const item of items) {
          if (!item?._id) continue;
          if (item.status === false) continue;
          addRoute(urls, `/product/${item._id}`, item.updatedAt || item.createdAt, "weekly", "0.8");
        }
      })
      .catch((err) => {
        console.warn(`Skipping products: ${err.message}`);
      }),
    fetchJson(`${API_BASE}/api/blogs/all`)
      .then((json) => {
        const items = Array.isArray(json) ? json : [];
        for (const item of items) {
          if (!item?._id) continue;
          if (item.status === false) continue;
          addRoute(urls, `/blog/${item._id}`, item.updatedAt || item.createdAt, "monthly", "0.7");
        }
      })
      .catch((err) => {
        console.warn(`Skipping blogs: ${err.message}`);
      }),
    fetchJson(`${API_BASE}/api/combos/active/list`)
      .then((json) => {
        const items = Array.isArray(json?.data) ? json.data : [];
        for (const item of items) {
          if (!item?._id) continue;
          addRoute(urls, `/combo/${item._id}`, item.updatedAt || item.createdAt, "weekly", "0.7");
        }
      })
      .catch((err) => {
        console.warn(`Skipping combos: ${err.message}`);
      }),
    fetchJson(`${API_BASE}/api/categories`)
      .then((json) => {
        const items = Array.isArray(json?.data) ? json.data : [];
        for (const item of items) {
          if (!item?._id) continue;
          addRoute(urls, `/shop/category/${item._id}`, item.updatedAt || item.createdAt, "weekly", "0.6");
          addRoute(urls, `/collections/${item._id}`, item.updatedAt || item.createdAt, "weekly", "0.5");
        }
      })
      .catch((err) => {
        console.warn(`Skipping categories: ${err.message}`);
      }),
    fetchJson(`${API_BASE}/api/concerns`)
      .then((json) => {
        const items = Array.isArray(json?.data) ? json.data : [];
        for (const item of items) {
          if (!item?.title) continue;
          addRoute(
            urls,
            `/shop/concern/${encodeURIComponent(item.title)}`,
            item.updatedAt || item.createdAt,
            "weekly",
            "0.5",
          );
        }
      })
      .catch((err) => {
        console.warn(`Skipping concerns: ${err.message}`);
      }),
    fetchJson(`${API_BASE}/api/ingredients`)
      .then((json) => {
        const items = Array.isArray(json?.data) ? json.data : [];
        for (const item of items) {
          if (!item?.title) continue;
          addRoute(
            urls,
            `/shop/ingredient/${encodeURIComponent(item.title)}`,
            item.updatedAt || item.createdAt,
            "weekly",
            "0.5",
          );
        }
      })
      .catch((err) => {
        console.warn(`Skipping ingredients: ${err.message}`);
      }),
  ];

  await Promise.all(tasks);

  const entries = [...urls.values()].sort((a, b) => a.route.localeCompare(b.route));
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (entry) =>
        `  <url>
    <loc>${escapeXml(`${SITE_URL}${entry.route}`)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");

  const outFile = path.resolve(process.cwd(), "public", "sitemap.xml");
  await fs.writeFile(outFile, xml, "utf8");
  console.log(`Sitemap generated: ${outFile}`);
  console.log(`Total URLs: ${entries.length}`);
};

buildSitemap().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exitCode = 1;
});
