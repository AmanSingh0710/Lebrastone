import { useEffect } from "react";

const applyLazyAttributes = (img) => {
  if (!(img instanceof HTMLImageElement)) return;
  if (img.dataset.priority === "high") return;
  if (!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
  if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
};

const GlobalImageLazyLoader = () => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.querySelectorAll("img").forEach(applyLazyAttributes);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;

          if (node.tagName === "IMG") {
            applyLazyAttributes(node);
            return;
          }

          node.querySelectorAll?.("img").forEach(applyLazyAttributes);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
};

export default GlobalImageLazyLoader;
