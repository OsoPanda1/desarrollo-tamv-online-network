"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function signOut() {
    setLoading(true)
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return <button className="portal-sign-out" type="button" onClick={signOut} disabled={loading}>{loading ? "Saliendo…" : "Cerrar sesión"}</button>
}
