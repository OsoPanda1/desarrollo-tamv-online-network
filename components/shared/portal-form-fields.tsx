"use client"

import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export function PortalFieldGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <FieldGroup className={`portal-field-group ${className}`}>{children}</FieldGroup>
}

type ControlAccessibilityProps = {
  "aria-describedby"?: string
  "aria-invalid"?: boolean
  "aria-errormessage"?: string
}

function accessibleControl(children: ReactNode, describedBy: string[], invalid: boolean, errorId?: string) {
  if (!isValidElement(children)) return children
  const control = children as ReactElement<ControlAccessibilityProps>
  const ids = [control.props["aria-describedby"], ...describedBy].filter(Boolean).join(" ")
  return cloneElement(control, {
    "aria-describedby": ids || undefined,
    "aria-invalid": invalid || control.props["aria-invalid"] || undefined,
    "aria-errormessage": errorId ?? control.props["aria-errormessage"],
  })
}

export function PortalField({
  id,
  label,
  description,
  error,
  children,
  invalid = false,
  className = "",
}: {
  id: string
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  children: ReactNode
  invalid?: boolean
  className?: string
}) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const hasError = invalid || Boolean(error)
  const describedBy = [descriptionId, errorId].filter((value): value is string => Boolean(value))
  return <Field className={`portal-field ${className}`} data-invalid={hasError || undefined}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    {accessibleControl(children, describedBy, hasError, errorId)}
    {description && <FieldDescription id={descriptionId} className="portal-field-description">{description}</FieldDescription>}
    {error && <FieldDescription id={errorId} className="form-error">{error}</FieldDescription>}
  </Field>
}

export function PortalCheckboxField({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  error,
  required = false,
}: {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  required?: boolean
}) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [descriptionId, errorId].filter((value): value is string => Boolean(value))
  return <Field className="portal-consent-field" orientation="horizontal" data-invalid={error ? true : undefined}>
    {accessibleControl(<Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} required={required} />, describedBy, Boolean(error), errorId)}
    <FieldContent>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description && <FieldDescription id={descriptionId} className="portal-field-description">{description}</FieldDescription>}
      {error && <FieldDescription id={errorId} className="form-error">{error}</FieldDescription>}
    </FieldContent>
  </Field>
}
