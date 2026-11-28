"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, PanelLeft, PanelRight, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { localizedPath, type Locale } from "@/lib/i18n"
import {
  isNavigationPathActive,
  navigationLabel,
  organizationNavigation,
  userNavigation,
  type NavigationGroup,
} from "@/lib/navigation"

type DrawerSide = "left" | "right"

type NavigationDrawerProps = {
  side: DrawerSide
  title: string
  description: string
  closeLabel: string
  groups: NavigationGroup[]
  locale: Locale
  pathname: string
  open: boolean
  openGroups: string[]
  onClose: () => void
  onToggleGroup: (id: string) => void
}

function NavigationDrawer({
  side,
  title,
  description,
  closeLabel,
  groups,
  locale,
  pathname,
  open,
  openGroups,
  onClose,
  onToggleGroup,
}: NavigationDrawerProps) {
  const english = locale === "en"
  return (
    <aside
      id={`navigation-drawer-${side}`}
      className={`navigation-drawer navigation-drawer-${side}${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal={open ? true : undefined}
      aria-hidden={!open}
      inert={!open}
      aria-labelledby={`navigation-drawer-${side}-title`}
      lang={locale}
    >
      <div className="navigation-drawer-heading">
        <div>
          <p className="eyebrow">{english ? "TAMV NAVIGATION" : "NAVEGACIÓN TAMV"}</p>
          <h2 id={`navigation-drawer-${side}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
        <button
          id={`navigation-drawer-${side}-close`}
          className="navigation-drawer-close"
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X aria-hidden="true" />
        </button>
      </div>
      <nav className="navigation-accordions" aria-label={title}>
        {groups.map((group) => {
          const expanded = openGroups.includes(group.id)
          const panelId = `navigation-group-${side}-${group.id}`
          return (
            <section className="navigation-accordion" key={group.id}>
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => onToggleGroup(group.id)}
                >
                  <span>{locale === "en" ? group.labelEn : group.labelEs}</span>
                  <ChevronDown aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} hidden={!expanded}>
                {group.links.map((link) => {
                  const active = isNavigationPathActive(pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      href={localizedPath(link.href, locale)}
                      aria-current={active ? "page" : undefined}
                      onClick={onClose}
                    >
                      {navigationLabel(link, locale)}
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </nav>
    </aside>
  )
}

export function TamvNavigationRails({ locale = "es" }: { locale?: Locale }) {
  const pathname = usePathname()
  const english = locale === "en"
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [leftGroups, setLeftGroups] = useState<string[]>([])
  const [rightGroups, setRightGroups] = useState<string[]>([])
  const activeSide: DrawerSide | null = leftOpen ? "left" : rightOpen ? "right" : null

  const activeLeftGroup = useMemo(
    () => userNavigation.find((group) => group.links.some((link) => isNavigationPathActive(pathname, link.href)))?.id,
    [pathname],
  )
  const activeRightGroup = useMemo(
    () => organizationNavigation.find((group) => group.links.some((link) => isNavigationPathActive(pathname, link.href)))?.id,
    [pathname],
  )

  useEffect(() => {
    if (!activeLeftGroup) return
    setLeftGroups((current) => current.includes(activeLeftGroup) ? current : [...current, activeLeftGroup])
  }, [activeLeftGroup])

  useEffect(() => {
    if (!activeRightGroup) return
    setRightGroups((current) => current.includes(activeRightGroup) ? current : [...current, activeRightGroup])
  }, [activeRightGroup])

  useEffect(() => {
    if (!activeSide) return
    const previousOverflow = document.body.style.overflow
    const drawer = document.getElementById(`navigation-drawer-${activeSide}`)
    const inertContainer = drawer?.parentElement ?? document.body
    const inertElements = Array.from(inertContainer.children)
      .filter((element): element is HTMLElement =>
        element instanceof HTMLElement
        && element !== drawer
        && !element.classList.contains("navigation-backdrop"))
      .map((element) => ({ element, inert: element.inert }))
    document.body.style.overflow = "hidden"
    for (const { element } of inertElements) element.inert = true

    const focusClose = () => document.getElementById(`navigation-drawer-${activeSide}-close`)?.focus()
    const focusAfterTransition = (event: TransitionEvent) => {
      if (event.target === drawer && event.propertyName === "transform") focusClose()
    }
    focusClose()
    const focusFrame = requestAnimationFrame(focusClose)
    drawer?.addEventListener("transitionend", focusAfterTransition)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        if (activeSide === "left") setLeftOpen(false)
        else setRightOpen(false)
        requestAnimationFrame(() => document.getElementById(`navigation-toggle-${activeSide}`)?.focus())
        return
      }
      if (event.key !== "Tab") return
      const focusable = Array.from(
        drawer?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") ?? [],
      ).filter((element) => element.getClientRects().length > 0)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      cancelAnimationFrame(focusFrame)
      drawer?.removeEventListener("transitionend", focusAfterTransition)
      document.body.style.overflow = previousOverflow
      for (const { element, inert } of inertElements) element.inert = inert
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeSide])

  function openDrawer(side: DrawerSide) {
    if (side === "left") {
      setRightOpen(false)
      setLeftOpen(true)
    } else {
      setLeftOpen(false)
      setRightOpen(true)
    }
  }

  function closeDrawer(side: DrawerSide, restoreFocus = false) {
    if (side === "left") setLeftOpen(false)
    else setRightOpen(false)
    if (restoreFocus) requestAnimationFrame(() => document.getElementById(`navigation-toggle-${side}`)?.focus())
  }

  function toggleGroup(side: DrawerSide, id: string) {
    const update = side === "left" ? setLeftGroups : setRightGroups
    update((current) => current.includes(id) ? current.filter((groupId) => groupId !== id) : [...current, id])
  }

  return (
    <>
      <button
        id="navigation-toggle-left"
        className="navigation-rail-toggle navigation-rail-toggle-left"
        type="button"
        aria-expanded={leftOpen}
        aria-controls="navigation-drawer-left"
        aria-label={leftOpen ? (english ? "Close user navigation" : "Cerrar navegación de usuarios") : (english ? "Open user navigation" : "Abrir navegación de usuarios")}
        onClick={() => openDrawer("left")}
      >
        <PanelLeft aria-hidden="true" />
        <span>{english ? "For users" : "Para usuarios"}</span>
      </button>
      <button
        id="navigation-toggle-right"
        className="navigation-rail-toggle navigation-rail-toggle-right"
        type="button"
        aria-expanded={rightOpen}
        aria-controls="navigation-drawer-right"
        aria-label={rightOpen ? (english ? "Close organization navigation" : "Cerrar navegación organizacional") : (english ? "Open organization navigation" : "Abrir navegación organizacional")}
        onClick={() => openDrawer("right")}
      >
        <PanelRight aria-hidden="true" />
        <span>{english ? "For organizations" : "Para organizaciones"}</span>
      </button>
      {activeSide ? (
        <button
          className="navigation-backdrop"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => closeDrawer(activeSide, true)}
        />
      ) : null}
      <NavigationDrawer
        side="left"
        title={english ? "People and independent users" : "Personas y usuarios independientes"}
        description={english ? "Learn, research, publish and manage your participation." : "Aprende, investiga, publica y gestiona tu participación."}
        closeLabel={english ? "Close user navigation" : "Cerrar navegación de usuarios"}
        groups={userNavigation}
        locale={locale}
        pathname={pathname}
        open={leftOpen}
        openGroups={leftGroups}
        onClose={() => closeDrawer("left", true)}
        onToggleGroup={(id) => toggleGroup("left", id)}
      />
      <NavigationDrawer
        side="right"
        title={english ? "Companies, institutions and academies" : "Empresas, instituciones y academias"}
        description={english ? "Cooperation, governance, research and technical integration." : "Cooperación, gobernanza, investigación e integración técnica."}
        closeLabel={english ? "Close organization navigation" : "Cerrar navegación organizacional"}
        groups={organizationNavigation}
        locale={locale}
        pathname={pathname}
        open={rightOpen}
        openGroups={rightGroups}
        onClose={() => closeDrawer("right", true)}
        onToggleGroup={(id) => toggleGroup("right", id)}
      />
    </>
  )
}
