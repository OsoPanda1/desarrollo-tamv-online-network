"use client"

import { useState } from "react"
import Link from "next/link"
import { MEMBERSHIP_TERMS_VERSION } from "@/lib/billing/plans"
import { ArrowUpRight, CreditCard, LoaderCircle } from "lucide-react"
import type { Locale } from "@/lib/i18n"

type PlanId = "individual" | "business"

function messageForStatus(status: number, fallback: string) {
  if (status === 401) return "Inicia sesión para continuar."
  if (status === 409) return "Ya existe un checkout o una suscripción de este plan."
  if (status === 503) return "La facturación aún no está configurada o está temporalmente indisponible."
  return fallback
}

function safeStripeUrl(value: unknown, allowedHost: string): string | null {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname === allowedHost ? url.toString() : null
  } catch {
    return null
  }
}

export function MembershipCheckout({
  planId,
  locale = "es",
}: {
  planId: PlanId
  locale?: Locale
}) {
  const english = locale === "en"
  const [businessName, setBusinessName] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function beginCheckout() {
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          planId,
          acceptedTerms: termsAccepted,
          termsVersion: MEMBERSHIP_TERMS_VERSION,
          ...(planId === "business" ? { businessName: businessName.trim() } : {}),
        }),
      })
      const payload = await response.json().catch(() => ({})) as { checkoutUrl?: unknown; error?: string }
      if (!response.ok) {
        if (response.status === 401) {
          window.location.assign(`/sign-in?callbackURL=${encodeURIComponent("/membresias")}`)
          return
        }
        throw new Error(messageForStatus(response.status, payload.error || "No fue posible iniciar el checkout."))
      }
      const url = safeStripeUrl(payload.checkoutUrl, "checkout.stripe.com")
      if (!url) throw new Error("El proveedor no devolvió una URL de pago segura.")
      window.location.assign(url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión. Inténtalo de nuevo.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="billing-control">
      {planId === "business" && (
        <label className="billing-field">
          <span>{english ? "Company or organization name" : "Nombre de la empresa u organización"}</span>
          <input
            autoComplete="organization"
            maxLength={160}
            required
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder={english ? "Your organization" : "Nombre de tu organización"}
          />
        </label>
      )}
      <button
        className="button membership-checkout-button"
        type="button"
        onClick={beginCheckout}
        disabled={busy || !termsAccepted || (planId === "business" && businessName.trim().length < 2)}
      >
        {busy ? <LoaderCircle className="billing-spinner" aria-hidden="true" /> : <CreditCard aria-hidden="true" />}
        {busy ? (english ? "Connecting to secure checkout…" : "Conectando con el checkout seguro…") : (english ? "Subscribe with Stripe" : "Contratar con Stripe")}
        {!busy && <ArrowUpRight aria-hidden="true" />}
      </button>
      <label className="billing-terms-check">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(event) => setTermsAccepted(event.target.checked)}
          required
        />
        <span>
          {english ? "I have read and accept the " : "He leído y acepto las "}
          <Link href="/membresias/condiciones" target="_blank" rel="noopener noreferrer">{english ? "membership terms" : "condiciones de membresía"}</Link>
          {english ? " and " : " y el "}
          <Link href="/privacidad" target="_blank" rel="noopener noreferrer">{english ? "privacy notice" : "aviso de privacidad"}</Link>
          {english ? ` (version ${MEMBERSHIP_TERMS_VERSION}).` : ` (versión ${MEMBERSHIP_TERMS_VERSION}).`}
        </span>
      </label>
      <p className="billing-hint">
        {english ? "Recurring monthly subscription. Payment status and access are confirmed by a signed Stripe webhook. You can manage eligible cancellations from the Stripe customer portal." : "Suscripción mensual recurrente. El estado del pago y el acceso se confirman mediante un webhook firmado de Stripe. Podrás gestionar las cancelaciones disponibles desde el portal de clientes de Stripe."}
      </p>
      {error && <p className="billing-error" role="alert">{error}</p>}
    </div>
  )
}

export function MembershipPortalButton({
  planId,
  locale = "es",
}: {
  planId: PlanId
  locale?: Locale
}) {
  const english = locale === "en"
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function openPortal() {
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ planId }),
      })
      const payload = await response.json().catch(() => ({})) as { portalUrl?: unknown; error?: string }
      if (!response.ok) {
        if (response.status === 401) {
          window.location.assign(`/sign-in?callbackURL=${encodeURIComponent("/membresias")}`)
          return
        }
        throw new Error(payload.error || "No fue posible abrir la gestión de facturación.")
      }
      const url = safeStripeUrl(payload.portalUrl, "billing.stripe.com")
      if (!url) throw new Error("El proveedor no devolvió una URL de gestión segura.")
      window.location.assign(url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión. Inténtalo de nuevo.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="billing-control">
      <button className="button button-secondary" type="button" onClick={openPortal} disabled={busy}>
        {busy ? <LoaderCircle className="billing-spinner" aria-hidden="true" /> : <CreditCard aria-hidden="true" />}
        {busy ? (english ? "Opening billing…" : "Abriendo facturación…") : (english ? "Manage subscription" : "Gestionar suscripción")}
      </button>
      {error && <p className="billing-error" role="alert">{error}</p>}
    </div>
  )
}
