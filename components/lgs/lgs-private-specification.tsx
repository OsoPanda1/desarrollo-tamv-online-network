type LgsPrivateSpecificationProps = {
  content: string | null
}

/**
 * Renders the canonical LGS specification only inside the founder-guarded
 * server page. The canonical source remains in server-side environment
 * configuration and is never bundled into a client component.
 */
export function LgsPrivateSpecification({ content }: LgsPrivateSpecificationProps) {
  return (
    <section className="lgs-panel lgs-private-specification" aria-labelledby="lgs-private-specification-title">
      <div className="lgs-panel-heading">
        <div>
          <p className="eyebrow">07 / FUENTE CANÓNICA RESTRINGIDA</p>
          <h2 id="lgs-private-specification-title">Especificación fundacional privada</h2>
          <p>
            El contenido se obtiene exclusivamente desde configuración del servidor.
            Esta vista no publica la especificación en rutas públicas ni la incorpora
            a componentes de cliente.
          </p>
        </div>
      </div>
      {content ? (
        <pre className="lgs-private-specification-content">{content}</pre>
      ) : (
        <p className="lgs-caveat" role="status">
          La especificación canónica no está configurada en este entorno. Define
          LGS_CANONICAL_SPEC_MARKDOWN en el gestor de secretos del entorno autorizado;
          no la incluyas en el repositorio ni en variables NEXT_PUBLIC_*.
        </p>
      )}
    </section>
  )
}
