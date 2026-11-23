import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { TamvAppShell } from "@/components/tamv-app-shell"

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Información provisional sobre los datos que procesa TAMV Online Network.",
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  const approvalConfigured = process.env.TAMV_MEMBERSHIP_PRIVACY_APPROVED === "true" &&
    process.env.TAMV_MEMBERSHIP_LEGAL_APPROVED === "true"
  return <TamvAppShell locale="es">
    <section className="section"><div className="container membership-legal-page">
      <p className="eyebrow">GOBERNANZA · DATOS PERSONALES</p>
      <h1>Aviso de privacidad de TAMV Online Network</h1>
      <div className="governance-notice"><ShieldCheck aria-hidden="true" /><p><strong>{approvalConfigured ? "Aprobación operativa configurada." : "Versión de trabajo: requiere validación del responsable."}</strong> {approvalConfigured ? "La configuración de despliegue declara aprobada la versión de privacidad; conserva evidencia de esa revisión." : "El responsable legal, domicilio, procedimiento formal para ejercer derechos, plazos de conservación y transferencias deben validarse antes de habilitar cobros con claves live. No se debe interpretar esta página provisional como dictamen de cumplimiento normativo."}</p></div>

      <h2>1. Datos que trata la aplicación</h2>
      <p>Según las funciones utilizadas, la aplicación puede tratar identificadores y datos de cuenta (nombre, correo y sesiones de autenticación), propuestas y respuestas enviadas por la persona usuaria, perfiles de investigación que decida publicar, solicitudes de colaboración, identificadores de suscripción y estado de pago procedentes de Stripe, nombre de la organización cuando se contrata un plan empresarial y progreso de los módulos formativos.</p>

      <h2>2. Finalidades</h2>
      <p>Los datos se utilizan para autenticar cuentas, registrar propuestas e intereses, mostrar perfiles que su titular haya decidido publicar, verificar el estado de membresía, abrir el portal de facturación y guardar el avance del curso. Los datos necesarios para procesar pagos se transmiten a Stripe; TAMV no almacena los datos completos de la tarjeta.</p>

      <h2>3. Publicación y consentimiento</h2>
      <p>No todo dato de cuenta se publica automáticamente. La información pública depende de las opciones de visibilidad y consentimiento disponibles en la función utilizada. No incluyas datos personales de terceros ni secretos en perfiles, propuestas o repositorios públicos. El consentimiento para compartir una propuesta o interés debe revisarse antes de publicarla o divulgarla fuera del portal.</p>

      <h2>4. Proveedores y seguridad</h2>
      <p>La aplicación utiliza infraestructura de despliegue, PostgreSQL, Better Auth y Stripe para funciones concretas. Cada proveedor puede procesar datos de conexión y servicio bajo sus condiciones. Las credenciales y secretos de integración se mantienen en variables de entorno del servidor y no se deben incorporar al repositorio.</p>

      <h2>5. Conservación, derechos y contacto</h2>
      <p>El periodo exacto de conservación, la identidad legal del responsable, el domicilio, los canales formales para ejercer derechos, el procedimiento de corrección/eliminación y la política de incidentes deben completarse y aprobarse por la persona responsable de la operación. Hasta completar esa revisión, esta página es informativa y provisional y no debe sustituir un aviso legal definitivo.</p>

      <h2>6. Estado de implementación</h2>
      <p>La activación live del checkout requiere que el operador confirme la versión y establezca la variable <code>TAMV_MEMBERSHIP_PRIVACY_APPROVED=true</code> solo después de revisar la política definitiva, la entidad responsable, la retención y las obligaciones aplicables. Esta variable no sustituye la revisión ni es una certificación automática de cumplimiento.</p>
      <p className="membership-back-link"><Link className="text-link" href="/membresias"><ArrowLeft aria-hidden="true" /> Volver a membresías</Link> · <Link className="text-link" href="/membresias/condiciones">Condiciones de membresía</Link></p>
    </div></section>
  </TamvAppShell>
}
