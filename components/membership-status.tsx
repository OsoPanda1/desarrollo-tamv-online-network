"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CheckCircle2, Clock3, RefreshCw, ShieldAlert } from "lucide-react"
import { MembershipPortalButton } from "@/components/membership-checkout"
import type { Locale } from "@/lib/i18n"

type Membership = {
  id: string
  planId: "individual" | "business"
  status: string
  amountMxn: number
  currency: "mxn"
  businessName: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  checkoutUrl: string | null
  entitled: boolean
}

type StatusState = "loading" | "anonymous" | "available" | "unavailable"

function statusLabel(status: string, english: boolean) {
  const values: Record<string, { es: string; en: string }> = {
    pending: { es: "Checkout pendiente", en: "Checkout pending" },
    active: { es: "Activa", en: "Active" },
    trialing: { es: "Prueba activa", en: "Trial active" },
    past_due: { es: "Pago pendiente", en: "Payment past due" },
    unpaid: { es: "Sin pago confirmado", en: "Payment not confirmed" },
    incomplete: { es: "Activación pendiente", en: "Activation pending" },
    incomplete_expired: { es: "Checkout vencido", en: "Checkout expired" },
    canceled: { es: "Cancelada", en: "Canceled" },
    paused: { es: "Pausada", en: "Paused" },
    checkout_failed: { es: "No se completó el checkout", en: "Checkout failed" },
    checkout_expired: { es: "Checkout vencido", en: "Checkout expired" },
    expired: { es: "Periodo vencido", en: "Period expired" },
  }
  return values[status]?.[english ? "en" : "es"] ?? status
}

function prettyDate(value: string | null, english: boolean) {
  if (!value) return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return new Intl.DateTimeFormat(english ? "en-US" : "es-MX", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(date)
}

export function MembershipStatus({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [state, setState] = useState<StatusState>("loading")
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (signal?: AbortSignal) => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/billing/me", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal,
      })
      if (response.status === 401) {
        setMemberships([])
        setState("anonymous")
        return
      }
      if (!response.ok) throw new Error("membership_status_unavailable")
      const data = await response.json() as { memberships?: Membership[] }
      setMemberships(Array.isArray(data.memberships) ? data.memberships : [])
      setState("available")
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      setState("unavailable")
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  if (state === "loading" || state === "anonymous") return null

  if (state === "unavailable") {
    return (
      <div className="membership-status-box" role="status">
        <ShieldAlert aria-hidden="true" />
        <div>
          <h3>{english ? "Membership status is temporarily unavailable" : "El estado de la membresía no está disponible"}</h3>
          <p>{english ? "Your payment has not been changed by this display. Check database migrations and the billing configuration, then retry." : "Esta pantalla no modifica tu pago. Comprueba las migraciones y la configuración de facturación y vuelve a consultar."}</p>
          <button className="button button-secondary" type="button" onClick={() => void load()} disabled={refreshing}>
            <RefreshCw aria-hidden="true" />{english ? "Refresh status" : "Actualizar estado"}
          </button>
        </div>
      </div>
    )
  }

  if (memberships.length === 0) return null

  return (
    <section className="membership-status-section" aria-labelledby="membership-status-title">
      <div className="membership-status-heading">
        <div>
          <p className="eyebrow">{english ? "YOUR ACCOUNT" : "TU CUENTA"}</p>
          <h2 id="membership-status-title">{english ? "Membership status" : "Estado de tus membresías"}</h2>
        </div>
        <button className="button button-secondary membership-refresh" type="button" onClick={() => void load()} disabled={refreshing}>
          <RefreshCw aria-hidden="true" />{english ? "Refresh" : "Actualizar"}
        </button>
      </div>
      <div className="membership-status-list">
        {memberships.map((membership) => {
          const entitled = membership.entitled
          const displayStatus = !entitled && (membership.status === "active" || membership.status === "trialing")
            ? "expired"
            : membership.status
          const periodEnd = prettyDate(membership.currentPeriodEnd, english)
          return (
            <article className="membership-status-card" key={membership.id}>
              <div className="membership-status-card-heading">
                <div>
                  <h3>{membership.planId === "business" ? (english ? "Business membership" : "Membresía empresarial") : (english ? "Individual membership" : "Membresía individual")}</h3>
                  <p className="membership-status-amount">${membership.amountMxn.toLocaleString(english ? "en-US" : "es-MX")} MXN / {english ? "month" : "mes"}</p>
                </div>
                <span className={`membership-status-badge ${entitled ? "is-active" : "is-pending"}`}>
                  {entitled ? <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
                  {statusLabel(displayStatus, english)}
                </span>
              </div>
              {membership.businessName && <p>{english ? "Organization: " : "Organización: "}<strong>{membership.businessName}</strong></p>}
              {periodEnd && <p>{membership.cancelAtPeriodEnd
                ? (english ? `Access is scheduled to end on ${periodEnd}.` : `El acceso está programado para finalizar el ${periodEnd}.`)
                : (english ? `Current period ends ${periodEnd}.` : `El periodo actual termina el ${periodEnd}.`)}</p>}
              {membership.status === "pending" && <p className="billing-hint">{english ? "Waiting for a signed Stripe event. The success redirect by itself does not activate access." : "Esperando un evento firmado de Stripe. El regreso del checkout por sí solo no activa el acceso."}</p>}
              <div className="membership-status-actions">
                {entitled && <Link className="text-link" href={english ? "/formacion?lang=en" : "/formacion"}>{english ? "Open member course" : "Abrir el curso de miembros"} <ArrowUpRight aria-hidden="true" /></Link>}
                {membership.status === "pending" && membership.checkoutUrl && (
                  <a className="text-link" href={membership.checkoutUrl} rel="noopener noreferrer">
                    {english ? "Resume secure checkout" : "Reanudar checkout seguro"} <ArrowUpRight aria-hidden="true" />
                  </a>
                )}
                {["active", "trialing", "past_due", "unpaid", "paused", "incomplete"].includes(membership.status) && <MembershipPortalButton planId={membership.planId} locale={locale} />}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
