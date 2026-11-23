"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CreditCard, LoaderCircle } from "lucide-react"
import { MEMBERSHIP_TERMS_VERSION } from "@/lib/billing/plans"
import type { Locale } from "@/lib/i18n"

type PlanId = "individual" | "business"

function statusMessage(status: number, english: boolean) {
  if (status === 401) return english ? "Sign in to continue." : "Inicia sesión para continuar."
  if (status === 409) return english
    ? "A pending checkout or subscription already exists for this plan."
    : "Ya existe un checkout pendiente o una suscripción para este plan."
  if (status === 503) return english
    ? "Membership checkout is not configured or is temporarily unavailable."
    : "La contratación no está configurada o está temporalmente indisponible."
  return english ? "The request could not be completed." : "No fue posible completar la solicitud."
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
    if (busy || !termsAccepted || (planId === "business" && businessName.trim().length < 2)) return
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
        throw new Error(payload.error || statusMessage(response.status, english))
      }
      const url = safeStripeUrl(payload.checkoutUrl, "checkout.stripe.com")
      if (!url) throw new Error(english ? "The provider did not return a trusted payment URL." : "El proveedor no devolvió una URL de pago confiable.")
      window.location.assign(url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (english ? "Connection error. Please try again." : "Error de conexión. Inténtalo de nuevo."))
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
          {english ? " and the " : " y el "}
          <Link href="/privacidad" target="_blank" rel="noopener noreferrer">{english ? "privacy notice" : "aviso de privacidad"}</Link>
          {english ? ` (version ${MEMBERSHIP_TERMS_VERSION}).` : ` (versión ${MEMBERSHIP_TERMS_VERSION}).`}
        </span>
      </label>
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
      <p className="billing-hint">
        {english ? "Recurring monthly subscription. Access activates only after Stripe confirms the subscription through its signed webhook. You can manage eligible cancellations in the customer portal." : "Suscripción mensual recurrente. El acceso se activa solo cuando Stripe confirma la suscripción mediante su webhook firmado. Podrás gestionar las cancelaciones disponibles en el portal de clientes."}
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
        throw new Error(payload.error || (english ? "Could not open subscription management." : "No fue posible abrir la gestión de facturación."))
      }
      const url = safeStripeUrl(payload.portalUrl, "billing.stripe.com")
      if (!url) throw new Error(english ? "The provider did not return a trusted billing URL." : "El proveedor no devolvió una URL de facturación confiable.")
      window.location.assign(url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (english ? "Connection error. Please try again." : "Error de conexión. Inténtalo de nuevo."))
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
