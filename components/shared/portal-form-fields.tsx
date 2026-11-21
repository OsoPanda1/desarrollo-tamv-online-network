"use client"

import type { ReactNode } from "react"
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

export function PortalField({
  id,
  label,
  description,
  children,
  invalid = false,
  className = "",
}: {
  id: string
  label: ReactNode
  description?: ReactNode
  children: ReactNode
  invalid?: boolean
  className?: string
}) {
  return <Field className={`portal-field ${className}`} data-invalid={invalid || undefined}>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    {children}
    {description && <FieldDescription className="portal-field-description">{description}</FieldDescription>}
  </Field>
}

export function PortalCheckboxField({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  required = false,
}: {
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  required?: boolean
}) {
  return <Field className="portal-consent-field" orientation="horizontal">
    <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} required={required} />
    <FieldContent>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description && <FieldDescription className="portal-field-description">{description}</FieldDescription>}
    </FieldContent>
  </Field>
}
