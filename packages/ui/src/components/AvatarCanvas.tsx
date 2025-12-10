"use client";

import { useEffect, useRef, useState } from "react";

import { getAvatarWasm } from "@repo/avatar-wasm";

import Avatar from "../primitives/Avatar";

import type { SxProps, Theme } from "@mui/material/styles";

export interface AvatarCanvasProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  sx?: SxProps<Theme>;
  fallbackText?: string;
}

export default function AvatarCanvas({
  src,
  alt,
  size = 48,
  className,
  sx,
  fallbackText,
}: AvatarCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const canvas = canvasRef.current;

    if (!canvas || !src) {
      setHasRendered(false);
      return () => {
        cancelled = true;
      };
    }

    if (typeof Image === "undefined") {
      setHasRendered(false);
      return () => {
        cancelled = true;
      };
    }

    const context = canvas.getContext("2d");

    if (!context) {
      setHasRendered(false);
      return () => {
        cancelled = true;
      };
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      if (cancelled) return;

      const targetSize = size;
      canvas.width = targetSize;
      canvas.height = targetSize;

      const minSide = Math.min(image.width, image.height);
      const sxOffset = (image.width - minSide) / 2;
      const syOffset = (image.height - minSide) / 2;

      context.clearRect(0, 0, targetSize, targetSize);
      context.drawImage(
        image,
        sxOffset,
        syOffset,
        minSide,
        minSide,
        0,
        0,
        targetSize,
        targetSize,
      );

      const imageData = context.getImageData(0, 0, targetSize, targetSize);
      const data = imageData.data;

      getAvatarWasm()
        .then((exports) => {
          if (cancelled) return;

          const adjust = (value: number) => {
            const adjusted = exports.adjust_channel(value);
            if (Number.isNaN(adjusted)) return value;
            if (adjusted < 0) return 0;
            if (adjusted > 255) return 255;
            return adjusted;
          };

          for (let i = 0; i < data.length; i += 4) {
            const red = data[i] ?? 0;
            const green = data[i + 1] ?? 0;
            const blue = data[i + 2] ?? 0;

            data[i] = adjust(red);
            data[i + 1] = adjust(green);
            data[i + 2] = adjust(blue);
          }

          context.putImageData(imageData, 0, 0);
          setHasRendered(true);
        })
        .catch(() => {
          if (!cancelled) {
            setHasRendered(false);
          }
        });
    };

    image.onerror = () => {
      if (!cancelled) {
        setHasRendered(false);
      }
    };

    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, size]);

  const displayFallback = !hasRendered || !src;
  const fallbackInitial = fallbackText?.[0]?.toUpperCase();

  return (
    <Avatar
      alt={alt}
      className={className}
      sx={{
        width: size,
        height: size,
        overflow: "hidden",
        ...sx,
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          display: displayFallback ? "none" : "block",
        }}
      />
      {displayFallback && fallbackInitial ? fallbackInitial : null}
    </Avatar>
  );
}
