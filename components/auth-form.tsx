"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { PortalCheckboxField, PortalField, PortalFieldGroup } from "@/components/shared/portal-form-fields"
import { authClient } from "@/lib/auth-client"
import type { Locale } from "@/lib/i18n"

export function AuthForm({ mode, locale = "es" }: { mode: "sign-in" | "sign-up"; locale?: Locale }) {
  const router = useRouter()
  const english = locale === "en"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acceptedPolicy, setAcceptedPolicy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === "sign-up"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name: name.trim() })
        : await authClient.signIn.email({ email, password })
      if (result.error) {
        setError(english ? "We could not complete sign-in. Check your details and try again." : "No pudimos completar el acceso. Revisa tus datos e inténtalo de nuevo.")
        return
      }
      router.push("/portal")
      router.refresh()
    } catch {
      setError(english ? "We could not connect to the sign-in service. Please try again." : "No fue posible conectar con el servicio de acceso. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="eyebrow">{english ? "RESEARCH PORTAL" : "PORTAL DE INVESTIGACIÓN"}</p>
      <h1 id="auth-title">{isSignUp ? (english ? "Create your research space." : "Crea tu espacio de investigación.") : (english ? "Continue your work." : "Continúa tu trabajo.")}</h1>
      <p className="auth-description">{isSignUp ? (english ? "Save proposals, evidence, and simulations in your own profile." : "Guarda propuestas, evidencia y simulaciones bajo tu propio perfil.") : (english ? "Access your proposals, researcher identity, and HCU runs." : "Accede a tus propuestas, identidad de investigación y ejecuciones HCU.")}</p>
      <form className="portal-form" onSubmit={handleSubmit}>
        <PortalFieldGroup>
          {isSignUp && <PortalField id="account-name" label={english ? "Account name" : "Nombre de cuenta"}><Input id="account-name" value={name} onChange={(event) => setName(event.target.value)} name="name" autoComplete="name" minLength={2} maxLength={100} required /></PortalField>}
          <PortalField id="account-email" label={english ? "Email address" : "Correo electrónico"}><Input id="account-email" value={email} onChange={(event) => setEmail(event.target.value)} name="email" type="email" autoComplete="email" maxLength={254} required /></PortalField>
          <PortalField id="account-password" label={english ? "Password" : "Contraseña"} description={isSignUp ? (english ? "Use at least 8 characters. Do not reuse a password from another service." : "Usa al menos 8 caracteres. No reutilices una contraseña de otro servicio.") : undefined}><Input id="account-password" value={password} onChange={(event) => setPassword(event.target.value)} name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={8} maxLength={128} required /></PortalField>
        </PortalFieldGroup>
        {isSignUp && <PortalCheckboxField id="privacy-policy" checked={acceptedPolicy} onCheckedChange={setAcceptedPolicy} required label={english ? "I accept the privacy and participation policy." : "Acepto la política de privacidad y participación."} description={<Link href={english ? "/gobernanza?lang=en#privacidad" : "/gobernanza#privacidad"} target="_blank" rel="noopener noreferrer">{english ? "Read the privacy policy" : "Consultar política de privacidad"}</Link>} />}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-copper" type="submit" disabled={loading || (isSignUp && !acceptedPolicy)}>{loading ? (english ? "Processing…" : "Procesando…") : isSignUp ? (english ? "Create account" : "Crear cuenta") : (english ? "Sign in" : "Iniciar sesión")}</button>
      </form>
      <p className="auth-switch">{isSignUp ? (english ? "Already have an account? " : "¿Ya tienes cuenta? ") : (english ? "New to the portal? " : "¿Aún no tienes cuenta? ")}<Link href={isSignUp ? (english ? "/sign-in?lang=en" : "/sign-in") : (english ? "/sign-up?lang=en" : "/sign-up")}>{isSignUp ? (english ? "Sign in" : "Inicia sesión") : (english ? "Create an account" : "Crea una cuenta")}</Link></p>
      <p className="auth-privacy">{english ? "An account does not verify academic identity. Private data stays in your portal and authorized workflows." : "La cuenta no acredita identidad académica. Los datos privados solo aparecen en tu portal y en funciones autorizadas."}</p>
    </section>
  )
}
