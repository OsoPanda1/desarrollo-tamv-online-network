"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"

export function AdminBootstrapForm() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/v1/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? "No fue posible completar la configuración.")
      setSuccess(true)
      setToken("")
      router.refresh()
    } catch (bootstrapError) {
      setError(bootstrapError instanceof Error ? bootstrapError.message : "No fue posible completar la configuración.")
    } finally {
      setLoading(false)
    }
  }

  return <form className="portal-form" onSubmit={submit}>
    <PortalFieldGroup><PortalField id="bootstrap-token" label="Token inicial de administración"><Input id="bootstrap-token" type="password" value={token} onChange={(event) => setToken(event.target.value)} minLength={32} maxLength={256} autoComplete="off" required /></PortalField></PortalFieldGroup>
    <p className="form-note">El token no se guarda ni aparece en la URL. La reclamación es de un solo uso; no compartas este dato.</p>
    {success && <p className="form-status" role="status">Cuenta administradora configurada. Actualiza la página para ver las herramientas.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-copper" type="submit" disabled={loading}>{loading ? "Verificando…" : "Reclamar configuración inicial"}</button>
  </form>
}
