export const proposalTransitions: Record<string, string[]> = {
  received: ["triage", "withdrawn"],
  triage: ["in_review", "changes_requested", "rejected"],
  in_review: ["changes_requested", "accepted", "rejected"],
  changes_requested: ["received", "withdrawn"],
  accepted: ["published", "changes_requested"],
  rejected: ["appealed"],
  appealed: ["in_review", "rejected"],
  published: [],
  withdrawn: [],
}

export function canTransitionProposal(from: string, to: string) {
  return proposalTransitions[from]?.includes(to) ?? false
}

export const proposalStatusLabels: Record<string, [string, string]> = {
  received: ["Recibida", "Received"],
  triage: ["Triage editorial", "Editorial triage"],
  in_review: ["En revisión", "In review"],
  changes_requested: ["Cambios solicitados", "Changes requested"],
  accepted: ["Aceptada editorialmente", "Editorially accepted"],
  rejected: ["No aceptada", "Not accepted"],
  appealed: ["En apelación", "Under appeal"],
  published: ["Publicada", "Published"],
  withdrawn: ["Retirada", "Withdrawn"],
}
