"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Product } from "@/lib/commerce/products";

type ChatMode = "docked" | "floating" | "minimized";

interface WidgetContextValue {
  currentProduct: Product | null;
  setCurrentProduct: (product: Product | null) => void;
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  navigateToProduct: (id: string) => void;
}

const WidgetContext = createContext<WidgetContextValue | null>(null);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>("docked");

  const navigateToProduct = useCallback(
    (id: string) => {
      router.push(`/widget/products/${id}`);
    },
    [router]
  );

  // Listen for view-product CustomEvent from json-render actions
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.productId) {
        navigateToProduct(detail.productId);
      }
    };
    window.addEventListener("view-product", handler);
    return () => window.removeEventListener("view-product", handler);
  }, [navigateToProduct]);

  // Clear product context when navigating back to /widget landing
  useEffect(() => {
    if (pathname === "/widget") {
      setCurrentProduct(null);
    }
  }, [pathname]);

  return (
    <WidgetContext.Provider
      value={{
        currentProduct,
        setCurrentProduct,
        chatMode,
        setChatMode,
        navigateToProduct,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidgetContext(): WidgetContextValue {
  const ctx = useContext(WidgetContext);
  if (!ctx) {
    throw new Error("useWidgetContext must be used within a WidgetProvider");
  }
  return ctx;
}

export function useOptionalWidgetContext(): WidgetContextValue | null {
  return useContext(WidgetContext);
}
