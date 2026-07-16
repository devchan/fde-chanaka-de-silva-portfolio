"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
        const scope = basePath ? `${basePath}/` : "/";
        navigator.serviceWorker.register(`${basePath}/sw.js`, { scope }).catch(() => {
          // Offline support is opportunistic; the site still works without it.
        });
      });
    }
  }, []);

  return null;
}
