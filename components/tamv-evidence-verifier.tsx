"use client"

import { useState } from "react"
import { CheckCircle2, ClipboardCheck, Fingerprint, ShieldAlert } from "lucide-react"
import type { Locale } from "@/lib/i18n"

type Result = { kind: "success" | "error" | "info"; text: string }
type LocaleCopy = {
  payload: string; payloadHint: string; hashInput: string; keyInput: string; signatureInput: string
  calculate: string; verify: string; hashLabel: string; hashNotCompared: string; hashMatch: string; hashMismatch: string
  signatureValid: string; signatureInvalid: string; required: string; secureContext: string; keyLength: string
  sigLength: string; cryptoError: string; privacy: string; exactBytes: string; noClaims: string
}
const copy: Record<Locale, LocaleCopy> = {
  es: {
    payload: "Mensaje o payload exacto en UTF-8",
    payloadHint: "Pega el contenido exacto que deseas comprobar. Los espacios y saltos de línea forman parte del mensaje firmado.",
    hashInput: "SHA-512 esperado (hexadecimal, opcional)",
    keyInput: "Clave pública Ed25519 (base64, 32 bytes)",
    signatureInput: "Firma Ed25519 (base64, 64 bytes)",
    calculate: "Calcular y comparar SHA-512",
    verify: "Verificar firma Ed25519",
    hashLabel: "SHA-512 calculado localmente",
    hashNotCompared: "Hash calculado en este navegador. No se comparó porque no proporcionaste un hash esperado.",
    hashMatch: "Coincidencia exacta entre el hash calculado y el hash esperado.",
    hashMismatch: "El hash calculado no coincide con el hash esperado.",
    signatureValid: "Firma válida para estos bytes exactos y esta clave pública.",
    signatureInvalid: "La firma no valida para estos bytes exactos y esta clave pública.",
    required: "Introduce el mensaje y los materiales que quieres verificar.",
    secureContext: "WebCrypto no está disponible. Usa un navegador compatible en un contexto seguro HTTPS o localhost.",
    keyLength: "La clave pública decodificada debe contener exactamente 32 bytes.",
    sigLength: "La firma decodificada debe contener exactamente 64 bytes.",
    cryptoError: "El navegador no pudo completar la operación criptográfica. Verifica formato, soporte Ed25519 y base64.",
    privacy: "El contenido permanece en este navegador: este verificador no envía datos al servidor ni los guarda.",
    exactBytes: "La firma se verifica sobre los bytes UTF-8 exactos del campo anterior; no normaliza JSON, espacios ni saltos de línea.",
    noClaims: "Esto no demuestra por sí solo la identidad del firmante, la confianza de la clave, la fecha, la inclusión en BookPI ni la veracidad del contenido.",
  },
  en: {
    payload: "Exact message or UTF-8 payload",
    payloadHint: "Paste the exact content to check. Spaces and line endings are part of the signed message.",
    hashInput: "Expected SHA-512 (hexadecimal, optional)",
    keyInput: "Ed25519 public key (base64, 32 bytes)",
    signatureInput: "Ed25519 signature (base64, 64 bytes)",
    calculate: "Calculate and compare SHA-512",
    verify: "Verify Ed25519 signature",
    hashLabel: "SHA-512 calculated locally",
    hashNotCompared: "Digest calculated in this browser. No comparison was performed because no expected digest was supplied.",
    hashMatch: "Exact match between calculated and expected digests.",
    hashMismatch: "The calculated digest does not match the expected digest.",
    signatureValid: "Signature is valid for these exact bytes and this public key.",
    signatureInvalid: "Signature is not valid for these exact bytes and this public key.",
    required: "Enter the message and the material you want to verify.",
    secureContext: "WebCrypto is unavailable. Use a compatible browser in a secure HTTPS or localhost context.",
    keyLength: "The decoded public key must contain exactly 32 bytes.",
    sigLength: "The decoded signature must contain exactly 64 bytes.",
    cryptoError: "The browser could not complete the cryptographic operation. Check format, Ed25519 support, and base64.",
    privacy: "Content stays in this browser: this verifier does not send data to a server or store it.",
    exactBytes: "The signature is checked over the exact UTF-8 bytes in the field above; JSON, spaces, and line endings are not normalized.",
    noClaims: "This alone does not prove signer identity, key trust, timestamp, BookPI inclusion, or the truth of the content.",
  },
}
function decodeBase64(value: string) {
  const normalized = value.replace(/\s+/g, "")
  if (!normalized || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
    throw new Error("Invalid base64")
  }
  const binary = window.atob(normalized)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}
function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function TamvEvidenceVerifier({ locale = "es" }: { locale?: Locale }) {
  const t = copy[locale]
  const [payload, setPayload] = useState("")
  const [expectedHash, setExpectedHash] = useState("")
  const [publicKey, setPublicKey] = useState("")
  const [signature, setSignature] = useState("")
  const [digest, setDigest] = useState("")
  const [hashResult, setHashResult] = useState<Result | null>(null)
  const [signatureResult, setSignatureResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState<"hash" | "signature" | null>(null)

  async function calculateHash() {
    setSignatureResult(null)
    if (!payload) {
      setHashResult({ kind: "error", text: t.required })
      return
    }
    if (!globalThis.crypto?.subtle) {
      setHashResult({ kind: "error", text: t.secureContext })
      return
    }
    setBusy("hash")
    try {
      const calculated = toHex(await globalThis.crypto.subtle.digest("SHA-512", new TextEncoder().encode(payload)))
      setDigest(calculated)
      const normalizedExpected = expectedHash.trim().toLowerCase().replace(/^sha-?512[:\s]*/i, "")
      if (!normalizedExpected) setHashResult({ kind: "info", text: t.hashNotCompared })
      else if (!/^[a-f0-9]{128}$/.test(normalizedExpected)) setHashResult({ kind: "error", text: locale === "en" ? "Expected SHA-512 must be 128 hexadecimal characters." : "El SHA-512 esperado debe contener 128 caracteres hexadecimales." })
      else setHashResult(calculated === normalizedExpected ? { kind: "success", text: t.hashMatch } : { kind: "error", text: t.hashMismatch })
    } catch {
      setHashResult({ kind: "error", text: t.cryptoError })
    } finally {
      setBusy(null)
    }
  }

  async function verifySignature() {
    setHashResult(null)
    if (!payload || !publicKey.trim() || !signature.trim()) {
      setSignatureResult({ kind: "error", text: t.required })
      return
    }
    if (!globalThis.crypto?.subtle) {
      setSignatureResult({ kind: "error", text: t.secureContext })
      return
    }
    setBusy("signature")
    try {
      const keyBytes = decodeBase64(publicKey)
      const signatureBytes = decodeBase64(signature)
      if (keyBytes.byteLength !== 32) throw new Error(t.keyLength)
      if (signatureBytes.byteLength !== 64) throw new Error(t.sigLength)
      const key = await globalThis.crypto.subtle.importKey("raw", keyBytes, { name: "Ed25519" }, false, ["verify"])
      const valid = await globalThis.crypto.subtle.verify({ name: "Ed25519" }, key, signatureBytes, new TextEncoder().encode(payload))
      setSignatureResult(valid ? { kind: "success", text: t.signatureValid } : { kind: "error", text: t.signatureInvalid })
    } catch (error) {
      const message = error instanceof Error && (error.message === t.keyLength || error.message === t.sigLength) ? error.message : t.cryptoError
      setSignatureResult({ kind: "error", text: message })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="sovereign-verifier" lang={locale}>
      <div className="sovereign-verifier-grid">
        <label className="sovereign-verifier-field sovereign-verifier-payload">
          <span>{t.payload}</span>
          <textarea value={payload} onChange={(event) => { setPayload(event.target.value); setDigest(""); setHashResult(null); setSignatureResult(null) }} rows={5} spellCheck={false} autoComplete="off" />
          <small>{t.payloadHint}</small>
        </label>
        <label className="sovereign-verifier-field">
          <span>{t.hashInput}</span>
          <input value={expectedHash} onChange={(event) => { setExpectedHash(event.target.value); setHashResult(null) }} autoComplete="off" spellCheck={false} />
        </label>
        <label className="sovereign-verifier-field">
          <span>{t.keyInput}</span>
          <textarea value={publicKey} onChange={(event) => { setPublicKey(event.target.value); setSignatureResult(null) }} rows={2} autoComplete="off" spellCheck={false} />
        </label>
        <label className="sovereign-verifier-field">
          <span>{t.signatureInput}</span>
          <textarea value={signature} onChange={(event) => { setSignature(event.target.value); setSignatureResult(null) }} rows={2} autoComplete="off" spellCheck={false} />
        </label>
      </div>
      <div className="sovereign-verifier-actions">
        <button className="sovereign-action sovereign-action-primary" type="button" onClick={() => void calculateHash()} disabled={busy !== null}><Fingerprint aria-hidden="true" />{busy === "hash" ? (locale === "en" ? "Calculating…" : "Calculando…") : t.calculate}</button>
        <button className="sovereign-action" type="button" onClick={() => void verifySignature()} disabled={busy !== null}><ShieldAlert aria-hidden="true" />{busy === "signature" ? (locale === "en" ? "Verifying…" : "Verificando…") : t.verify}</button>
      </div>
      {digest && <div className="sovereign-verifier-digest"><span>{t.hashLabel}</span><code>{digest}</code><button type="button" onClick={() => void navigator.clipboard?.writeText(digest)}><ClipboardCheck aria-hidden="true" />{locale === "en" ? "Copy" : "Copiar"}</button></div>}
      {hashResult && <p className={"sovereign-verifier-result is-" + hashResult.kind} role="status"><ResultIcon kind={hashResult.kind} />{hashResult.text}</p>}
      {signatureResult && <p className={"sovereign-verifier-result is-" + signatureResult.kind} role="status"><ResultIcon kind={signatureResult.kind} />{signatureResult.text}</p>}
      <p className="sovereign-verifier-note">{t.privacy} {t.exactBytes} {t.noClaims}</p>
    </div>
  )
}

function ResultIcon({ kind }: { kind: Result["kind"] }) {
  if (kind === "success") return <CheckCircle2 aria-hidden="true" />
  if (kind === "error") return <ShieldAlert aria-hidden="true" />
  return <Fingerprint aria-hidden="true" />
}
