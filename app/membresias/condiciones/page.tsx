import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"

export const metadata: Metadata = {
  title: "Condiciones de las membresías",
  description: "Condiciones de alcance y facturación de las membresías de TAMV Online Network.",
  robots: { index: true, follow: true },
}

export default function MembershipTermsPage() {
  const version = "TAMV-MEMBERSHIP-TERMS-2026-11-23-v1"
  const liveApproved = process.env.TAMV_MEMBERSHIP_TERMS_VERSION === version &&
    process.env.TAMV_MEMBERSHIP_PRIVACY_APPROVED === "true" &&
    process.env.TAMV_MEMBERSHIP_LEGAL_APPROVED === "true" &&
    process.env.TAMV_MEMBERSHIP_TAX_APPROVED === "true" &&
    process.env.TAMV_MEMBERSHIP_REFUNDS_APPROVED === "true"

  return <TamvAppShell locale="es">
    <section className="section"><div className="container membership-legal-page">
      <p className="eyebrow">MEMBRESÍAS · CONDICIONES</p>
      <h1>Condiciones de las membresías TAMV</h1>
      <p className="membership-legal-lede">Versión documental: {version}. Esta página explica el alcance funcional y de cobro de los planes individuales y empresariales de TAMV Online Network.</p>
      <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p><strong>{liveApproved ? "Estado de aprobación configurado." : "Estado: pendiente de aprobación legal y operativa."}</strong> {liveApproved ? "La plataforma tiene la versión y la aprobación operativa indicadas por configuración." : "El checkout en modo live permanece bloqueado hasta que el responsable confirme estas condiciones, el aviso de privacidad, la política fiscal y el tratamiento de reembolsos en el entorno de despliegue."}</p></div>

      <h2>1. Planes y alcance</h2>
      <p><strong>Membresía individual:</strong> $229 MXN al mes por cuenta. Incluye la ruta de aprendizaje de perfil profesional, portafolio y presentación de proyectos, además de la posibilidad de postular a oportunidades de colaboración en TAMV.</p>
      <p><strong>Membresía empresarial:</strong> $699 MXN al mes por organización. Incluye la ruta de preparación de la organización y su proyecto, y la posibilidad de presentar iniciativas para evaluación y colaboración con TAMV. El precio empresarial no implica asientos ilimitados ni licencias para un número ilimitado de personas.</p>
      <p>En esta versión, la suscripción empresarial se asocia a la cuenta titular que contrata y al nombre de organización indicado en el checkout. No se han implementado invitaciones de empleados, asientos adicionales, administración multiusuario ni transferencia automática a otras cuentas. No compartas credenciales; TAMV debe publicar y probar esas funciones antes de ofrecer acceso de equipo.</p>
      <p>Las dos membresías se cobran mensualmente, no son una acreditación académica y no sustituyen asesoría jurídica, fiscal o financiera profesional.</p>

      <h2>2. Renovación y cancelación</h2>
      <p>La suscripción es recurrente y continúa cada mes hasta que el titular la cancele. La gestión de la suscripción, del método de pago y de la cancelación se realiza desde el portal de clientes de Stripe. La fecha efectiva de cancelación y el acceso restante deben coincidir con la configuración mostrada por Stripe y con la confirmación de cancelación recibida. Antes de habilitar cobros live, el operador debe configurar y probar en Stripe la modalidad de cancelación y el flujo de atención de cobros fallidos.</p>

      <h2>3. Pagos, impuestos y reembolsos</h2>
      <p>Stripe procesa los pagos recurrentes. TAMV no recibe ni almacena números completos de tarjeta en su aplicación. El importe y la información final de pago deben revisarse en el checkout antes de confirmar la contratación.</p>
      <p><strong>Condición previa al lanzamiento:</strong> la persona operadora debe aprobar y publicar la política fiscal aplicable, la presentación de IVA/impuestos en Stripe, la política de reembolsos y los datos del proveedor legal. Mientras esa revisión no esté aprobada, el sistema no debe aceptar suscripciones con claves live.</p>

      <h2>4. Participación en proyectos e inversionistas</h2>
      <p>La membresía habilita una ruta para postular a proyectos y para preparar documentación y presentaciones. Cada participación depende de la revisión, pertinencia, capacidad y gobernanza del proyecto correspondiente. TAMV no garantiza aceptación, publicación, contratos, clientes, inversión, créditos, subvenciones, reuniones ni presentaciones con inversionistas.</p>

      <h2>5. AI Lounge y otros servicios externos</h2>
      <p>AI Lounge es una plataforma de terceros independiente. En esta implementación no se ha acreditado ni configurado un acuerdo de afiliación o un pase automático de TAMV. La membresía TAMV ofrece una ruta informativa para explorar el sitio público; los planes Pro, contactos privados, créditos, presentaciones y demás beneficios se rigen por los términos, elegibilidad y precios vigentes del proveedor externo.</p>

      <h2>6. Cuenta, privacidad y soporte</h2>
      <p>El portal guarda datos de cuenta, identificadores de la suscripción y el avance del curso para operar el servicio. No envíes contraseñas, claves API ni información financiera sensible en propuestas o formularios de colaboración. El aviso de privacidad vigente debe consultarse antes de contratar; la activación de cobros live exige que el responsable y sus canales de ejercicio de derechos estén identificados y validados.</p>

      <h2>7. Aprobación de versión</h2>
      <p>Esta versión es una base operativa del producto, no una opinión jurídica. Antes del cobro live, el responsable debe comprobar que corresponde a su entidad operadora, obligaciones fiscales y normativa aplicable, y fijar la variable <code>TAMV_MEMBERSHIP_TERMS_VERSION</code> al identificador de esta versión solo tras aprobar las condiciones finales.</p>
      <p className="membership-back-link"><Link className="text-link" href="/membresias"><ArrowLeft aria-hidden="true" /> Volver a membresías</Link> · <Link className="text-link" href="/privacidad">Aviso de privacidad</Link></p>
    </div></section>
  </TamvAppShell>
}
