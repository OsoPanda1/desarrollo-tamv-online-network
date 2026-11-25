"use client"

import { useState } from "react"
import type { Locale } from "@/lib/i18n"
import type { VideoSpec } from "@/lib/visuals/catalog"

/**
 * A motion capsule that stays dormant until the visitor asks for it.
 *
 * Nothing autoplays, no network request is made for the video until the click,
 * and `prefers-reduced-motion` is respected because the poster is the default
 * state. The clip has no audio track, so it is muted and marked decorative;
 * the real description lives in the caption for screen readers.
 */
export function VideoCapsule({
  video,
  locale = "es",
  className = "",
}: {
  video: VideoSpec
  locale?: Locale
  className?: string
}) {
  const es = locale === "es"
  const [active, setActive] = useState(false)
  const [failed, setFailed] = useState(false)
  const title = es ? video.titleEs : video.titleEn
  const summary = es ? video.summaryEs : video.summaryEn
  const method = es ? video.methodEs : video.methodEn

  return (
    <figure className={`video-capsule ${className}`.trim()}>
      <div className="video-frame">
        {active && !failed ? (
          <video
            className="video-el"
            src={video.src}
            poster={video.poster}
            controls
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={`${title}. ${summary}`}
            onError={() => setFailed(true)}
          />
        ) : (
          <button
            type="button"
            className="video-poster"
            onClick={() => {
              setFailed(false)
              setActive(true)
            }}
            aria-label={es ? `Reproducir la cápsula «${title}» (${video.durationSeconds} s)` : `Play the capsule “${title}” (${video.durationSeconds} s)`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={video.poster} alt="" width={1024} height={576} loading="lazy" decoding="async" />
            <span className="video-scrim" aria-hidden="true" />
            <span className="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
            </span>
            <span className="video-meta">
              <span className="video-index">{es ? "CÁPSULA" : "CAPSULE"} {video.index}</span>
              <span className="video-duration">{video.durationSeconds}s</span>
            </span>
            {failed && (
              <span className="video-failed">
                {es ? "El video no pudo cargarse. La placa editorial sigue disponible." : "The video could not load. The editorial plate is still available."}
              </span>
            )}
          </button>
        )}
      </div>
      <figcaption className="video-caption">
        <div className="video-caption-head">
          <h3>{title}</h3>
          <span className="video-code">{video.index}</span>
        </div>
        <p>{summary}</p>
        <p className="video-method">
          <span aria-hidden="true">◈</span> {method}
        </p>
      </figcaption>
    </figure>
  )
}
