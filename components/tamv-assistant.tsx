"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { ArrowDown, LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Message, MessageContent, MessageHeader } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerItem,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import type { Locale } from "@/lib/i18n"

const suggestions = {
  es: [
    "Guíame desde cero por TAMV, paso a paso.",
    "Explícamelo con una analogía de la vida cotidiana.",
    "Quiero el recorrido intermedio: flujo, errores y comprobaciones.",
    "Dame el recorrido experto por módulos, datos y límites técnicos.",
    "Enséñame cómo funciona un DOI con un ejemplo práctico.",
  ],
  en: [
    "Guide me through TAMV from zero, step by step.",
    "Explain it with an everyday analogy.",
    "Give me the intermediate workflow, errors, and checks.",
    "Give me the expert route through modules, data, and technical boundaries.",
    "Teach me how a DOI works with a practical example.",
  ],
} as const

export function TamvAssistant({ locale = "es" }: { locale?: Locale }) {
  const english = locale === "en"
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/assistant" }),
  })
  const isBusy = status === "submitted" || status === "streaming"

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function submitMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    sendMessage({ text: trimmed })
    setInput("")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitMessage(input)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <div className="isabella-assistant" lang={locale}>
      <button
        className="isabella-launcher"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={english ? "Chat with Isabella, the TAMV virtual guide" : "Chatear con Isabella, la guía virtual de TAMV"}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles aria-hidden="true" />
        <span>Isabella</span>
        <span className="isabella-launcher-caption">{english ? "TAMV guide" : "Guía TAMV"}</span>
      </button>

      <dialog
        className="isabella-dialog"
        ref={dialogRef}
        aria-labelledby="isabella-title"
        aria-describedby="isabella-description"
        onClose={() => setIsOpen(false)}
      >
        <section className="isabella-panel">
          <header className="isabella-header">
            <div className="isabella-avatar" aria-hidden="true"><Sparkles /></div>
            <div className="isabella-header-copy">
              <p className="isabella-eyebrow">{english ? "TAMV VIRTUAL GUIDE" : "GUÍA VIRTUAL DE TAMV"}</p>
              <h2 id="isabella-title">Isabella</h2>
              <p id="isabella-description">{english ? "Ask about the site, projects, research, or how to get started." : "Pregunta por el sitio, los proyectos, la investigación o cómo empezar."}</p>
            </div>
            <button className="isabella-close" type="button" aria-label={english ? "Close Isabella" : "Cerrar Isabella"} onClick={() => setIsOpen(false)}><X aria-hidden="true" /></button>
          </header>

          <MessageScrollerProvider>
            <MessageScroller className="isabella-transcript">
              <MessageScrollerViewport
              className="isabella-transcript-viewport"
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              aria-label={english ? "Conversation with Isabella" : "Conversación con Isabella"}
            >
              <MessageScrollerContent className="isabella-transcript-content">
                {messages.length === 0 ? (
                  <div className="isabella-welcome">
                    <span className="isabella-welcome-mark"><MessageCircle aria-hidden="true" /></span>
                    <p>{english ? "Hello, I’m Isabella. I can help you find your way around TAMV and explain what the published materials say." : "Hola, soy Isabella. Puedo ayudarte a recorrer TAMV y explicar lo que indican sus materiales publicados."}</p>
                    <p className="isabella-welcome-note">{english ? "I’ll distinguish documented claims from independently verified facts." : "Distinguiré las afirmaciones documentadas de los hechos verificados de forma independiente."}</p>
                    <p className="isabella-welcome-note">{english ? "Learn at beginner, intermediate, or expert level. If one explanation does not work, ask for an analogy, a worked example, a checklist, or guided practice." : "Aprende en nivel básico, intermedio o experto. Si una explicación no funciona, pide una analogía, un ejemplo resuelto, una lista de comprobación o práctica guiada."}</p>
                    <div className="isabella-suggestions">
                      {suggestions[locale].map((suggestion) => <button type="button" key={suggestion} onClick={() => submitMessage(suggestion)}>{suggestion}</button>)}
                    </div>
                  </div>
                ) : (
                  <div className="isabella-messages" role="list" aria-label={english ? "Messages" : "Mensajes"}>
                    {messages.map((message) => {
                      const isUser = message.role === "user"
                      return (
                        <MessageScrollerItem
                          className={`isabella-message isabella-message-${message.role}`}
                          key={message.id}
                          role="listitem"
                        >
                          <Message align={isUser ? "end" : "start"} className="isabella-message-row">
                            <MessageContent className="isabella-message-content">
                              <MessageHeader className="isabella-message-label">
                                {isUser ? (english ? "You" : "Tú") : "Isabella"}
                              </MessageHeader>
                              <Bubble align={isUser ? "end" : "start"} variant={isUser ? "default" : "secondary"}>
                                <BubbleContent className="isabella-bubble-content">
                                  {message.parts.map((part, index) => part.type === "text" ? <p key={`${message.id}-${index}`}>{part.text}</p> : null)}
                                </BubbleContent>
                              </Bubble>
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      )
                    })}
                  </div>
                )}
                {isBusy && (
                  <MessageScrollerItem className="isabella-status-row">
                    <Marker className="isabella-status" role="status" aria-live="polite">
                      <MarkerIcon><LoaderCircle aria-hidden="true" /></MarkerIcon>
                      <MarkerContent>{english ? "Isabella is replying…" : "Isabella está respondiendo…"}</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                )}
                {error && (
                  <MessageScrollerItem className="isabella-status-row">
                    <Marker className="isabella-error" role="alert">
                      <MarkerContent>{english ? "I couldn’t answer just now. Please try again in a moment." : "No pude responder en este momento. Inténtalo de nuevo en un momento."}</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton className="isabella-scroll-latest" direction="end">
                <ArrowDown aria-hidden="true" />
                <span className="sr-only">{english ? "Scroll to latest message" : "Ir al último mensaje"}</span>
              </MessageScrollerButton>
            </MessageScroller>
          </MessageScrollerProvider>

          <form className="isabella-composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="isabella-prompt">{english ? "Your message to Isabella" : "Tu mensaje para Isabella"}</label>
            <textarea
              id="isabella-prompt"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={1200}
              rows={2}
              placeholder={english ? "Ask a question…" : "Escribe tu pregunta…"}
              disabled={isBusy}
            />
            {isBusy ? (
              <button className="isabella-send" type="button" aria-label={english ? "Stop response" : "Detener respuesta"} onClick={() => stop()}><span>{english ? "Stop" : "Detener"}</span></button>
            ) : (
              <button className="isabella-send" type="submit" aria-label={english ? "Send message" : "Enviar mensaje"} disabled={!input.trim()}><Send aria-hidden="true" /></button>
            )}
          </form>
          <p className="isabella-privacy-note">{english ? "This conversation is temporary. Don’t share sensitive personal information." : "La conversación es temporal. No compartas información personal sensible."}</p>
        </section>
      </dialog>
    </div>
  )
}
