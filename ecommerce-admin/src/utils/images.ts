export type OptimizedImageFormat = "avif" | "webp";

const responsiveWidths = [160, 240, 320, 480, 640, 768, 960, 1200, 1600];
const preloadedImages = new Set<string>();

export const isRemoteHttpImage = (src: string) => /^https?:\/\//i.test(src);

export const isPreloadableImage = (src: string) => Boolean(src) && !src.startsWith("data:");

const getUrl = (src: string) => {
  try {
    return new URL(src);
  } catch {
    return null;
  }
};

const isCloudinaryImage = (url: URL) =>
  /(^|\.)res\.cloudinary\.com$/i.test(url.hostname) &&
  url.pathname.includes("/image/upload/");

const isUnsplashImage = (url: URL) =>
  url.hostname.toLowerCase() === "images.unsplash.com";

export const canOptimizeImage = (src: string) => {
  const url = getUrl(src);

  if (!url || !isRemoteHttpImage(src)) return false;

  return isCloudinaryImage(url) || isUnsplashImage(url);
};

export const buildOptimizedImageUrl = (
  src: string,
  width: number,
  format?: OptimizedImageFormat
) => {
  const url = getUrl(src);

  if (!url || !isRemoteHttpImage(src)) return src;

  const normalizedWidth = Math.max(1, Math.round(width));

  if (isCloudinaryImage(url)) {
    const uploadMarker = "/image/upload/";
    const uploadIndex = url.pathname.indexOf(uploadMarker);
    const prefix = url.pathname.slice(0, uploadIndex + uploadMarker.length);
    const suffix = url.pathname.slice(uploadIndex + uploadMarker.length);
    const transformations = [
      "c_limit",
      `w_${normalizedWidth}`,
      "q_auto:good",
      format ? `f_${format}` : "f_auto",
    ].join(",");

    url.pathname = `${prefix}${transformations}/${suffix}`;

    return url.toString();
  }

  if (isUnsplashImage(url)) {
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", "88");
    url.searchParams.set("w", String(normalizedWidth));

    if (format) {
      url.searchParams.set("fm", format);
    }

    return url.toString();
  }

  return src;
};

export const getResponsiveWidths = (targetWidth: number) => {
  const upperBound = Math.max(480, Math.ceil(targetWidth * 2));
  const widths = responsiveWidths.filter((width) => width <= upperBound);
  const target = Math.max(160, Math.round(targetWidth));

  if (!widths.includes(target)) {
    widths.push(target);
  }

  return [...new Set(widths)].sort((first, second) => first - second);
};

export const buildOptimizedSrcSet = (
  src: string,
  targetWidth: number,
  format?: OptimizedImageFormat
) => {
  if (!canOptimizeImage(src)) return undefined;

  return getResponsiveWidths(targetWidth)
    .map((width) => `${buildOptimizedImageUrl(src, width, format)} ${width}w`)
    .join(", ");
};

export const preloadOptimizedImage = (
  src: string,
  width: number,
  sizes: string
) => {
  if (
    typeof document === "undefined" ||
    !isPreloadableImage(src) ||
    preloadedImages.has(src)
  ) {
    return;
  }

  const href = buildOptimizedImageUrl(src, Math.min(1600, Math.max(width, 240)));
  const srcSet = buildOptimizedSrcSet(src, width);
  const link = document.createElement("link");

  link.rel = "preload";
  link.as = "image";
  link.href = href;

  if (srcSet) {
    link.setAttribute("imagesrcset", srcSet);
    link.setAttribute("imagesizes", sizes);
  }

  document.head.appendChild(link);
  preloadedImages.add(src);
};
