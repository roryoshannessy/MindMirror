"use client";

import { useMemo } from "react";
import { getCatalog, type CommercialCatalog } from "@/config/commercial-catalog";

export function useCatalog(): CommercialCatalog {
  return useMemo(() => getCatalog(), []);
}
