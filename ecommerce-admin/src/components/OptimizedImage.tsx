import {
  memo,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from "react";
import {
  buildOptimizedImageUrl,
  buildOptimizedSrcSet,
  isPreloadableImage,
  preloadOptimizedImage,
} from "../utils/images";

type ImageFit = "cover" | "contain";

interface OptimizedImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "srcSet" | "sizes" | "loading" | "width" | "height"
  > {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  fit?: ImageFit;
  wrapperClassName?: string;
  imageClassName?: string;
  fallbackSrc?: string;
}

const loadedImages = new Set<string>();

const fallbackImage =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23f8fafc'/%3E%3Cstop offset='1' stop-color='%23e2e8f0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='600' fill='url(%23g)'/%3E%3Cpath d='M230 380h340l-88-112-68 78-54-62-130 96Z' fill='%23cbd5e1'/%3E%3Ccircle cx='315' cy='228' r='38' fill='%23cbd5e1'/%3E%3Ctext x='400' y='472' text-anchor='middle' font-family='Arial,sans-serif' font-size='32' fill='%2364758b'%3EProduct image unavailable%3C/text%3E%3C/svg%3E";

const OptimizedImage = memo(
  ({
    src,
    alt,
    width,
    height,
    sizes,
    priority = false,
    fit = "cover",
    wrapperClassName = "",
    imageClassName = "",
    fallbackSrc = fallbackImage,
    style,
    onLoad,
    onError,
    ...imageProps
  }: OptimizedImageProps) => {
    const requestedSrc = src || fallbackSrc;
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const [loadedSrc, setLoadedSrc] = useState<string | null>(() =>
      loadedImages.has(requestedSrc) ? requestedSrc : null
    );
    const currentSrc =
      failedSrc === requestedSrc && requestedSrc !== fallbackSrc
        ? fallbackSrc
        : requestedSrc;
    const isLoaded =
      loadedImages.has(currentSrc) || loadedSrc === currentSrc;

    const avifSrcSet = useMemo(
      () => buildOptimizedSrcSet(currentSrc, width, "avif"),
      [currentSrc, width]
    );
    const webpSrcSet = useMemo(
      () => buildOptimizedSrcSet(currentSrc, width, "webp"),
      [currentSrc, width]
    );
    const fallbackSrcSet = useMemo(
      () => buildOptimizedSrcSet(currentSrc, width),
      [currentSrc, width]
    );
    const fallbackSizedSrc = useMemo(
      () => buildOptimizedImageUrl(currentSrc, Math.min(1600, Math.max(width, 240))),
      [currentSrc, width]
    );

    useEffect(() => {
      if (priority && isPreloadableImage(currentSrc)) {
        preloadOptimizedImage(currentSrc, width, sizes);
      };
    }, [currentSrc, priority, sizes, width]);

    const wrapperStyle = {
      aspectRatio: `${width} / ${height}`,
    } as CSSProperties;

    const handleLoad: ImgHTMLAttributes<HTMLImageElement>["onLoad"] = (event) => {
      loadedImages.add(currentSrc);
      setLoadedSrc(currentSrc);
      onLoad?.(event);
    };

    const handleError: ImgHTMLAttributes<HTMLImageElement>["onError"] = (event) => {
      if (currentSrc !== fallbackSrc) {
        setFailedSrc(requestedSrc);
      }
      onError?.(event);
    };

    return (
      <span
        className={[
          "relative block overflow-hidden bg-slate-100",
          "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent before:opacity-0 before:content-['']",
          !isLoaded
            ? "before:animate-[image-shimmer_1.35s_ease-in-out_infinite] before:opacity-100"
            : "",
          wrapperClassName,
        ].join(" ")}
        style={wrapperStyle}
      >
        <picture>
          {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
          {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
          <img
            src={fallbackSizedSrc}
            srcSet={fallbackSrcSet}
            sizes={fallbackSrcSet ? sizes : undefined}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            className={[
              "h-full w-full transition duration-500 ease-out",
              fit === "contain" ? "object-contain" : "object-cover",
              isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
              imageClassName,
            ].join(" ")}
            style={style}
            onLoad={handleLoad}
            onError={handleError}
            {...imageProps}
          />
        </picture>
      </span>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
