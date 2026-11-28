"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function signOut() {
    setLoading(true)
    setError(false)
    try {
      const result = await authClient.signOut()
      if (result.error) throw new Error("sign-out failed")
      router.push("/")
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button className="portal-sign-out" type="button" onClick={signOut} disabled={loading}>{loading ? "Saliendo…" : "Cerrar sesión"}</button>
      {error && <p className="form-error" role="alert">No fue posible cerrar la sesión. Inténtalo de nuevo.</p>}
    </>
  )
}
