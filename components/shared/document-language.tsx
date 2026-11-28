"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function DocumentLanguage() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    document.documentElement.lang = searchParams.get("lang") === "en" ? "en" : "es"
  }, [pathname, searchParams])

  return null
}
