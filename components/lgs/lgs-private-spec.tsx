export function LgsPrivateSpecification({ content }: { content: string | null }) {
  return (
    <section className="lgs-panel lgs-private-specification" aria-labelledby="lgs-private-spec-title">
      <p className="eyebrow">07 / DOCUMENTO CANÓNICO RESTRINGIDO</p>
      <h2 id="lgs-private-spec-title">Especificación fundacional completa</h2>
      {content ? (
        <pre className="lgs-private-spec-content">{content}</pre>
      ) : (
        <div className="lgs-private-spec-missing" role="status">
          <strong>El documento privado todavía no está configurado.</strong>
          <p>Para mantener la confidencialidad, el contenido canónico no se guarda en este repositorio público. Configura LGS_CANONICAL_SPEC_MARKDOWN como variable de entorno exclusivamente del servidor, después de revisar la visibilidad del repositorio y completar los controles de autenticación reforzada.</p>
        </div>
      )}
    </section>
  )
}
