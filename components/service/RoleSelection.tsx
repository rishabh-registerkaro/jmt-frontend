"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// Shares the roles ticked in "Roles we supply" (RolesPicker) with the request
// form at the bottom of the service page (LeadForm), so the visitor sees — and
// can change — what they're asking for before sending it. Only service pages
// render the provider; elsewhere (homepage) useRoleSelection() returns null and
// the form looks as before.

export interface SelectableRole {
  id: string;
  name: string;
}

interface RoleSelectionValue {
  /** Id of the roles section, for "Edit roles" links; null when it's hidden. */
  rolesSectionId: string | null;
  /** Every role on the page, in display order. */
  roles: SelectableRole[];
  selected: string[];
  /** Selected roles in display order. */
  selectedRoles: SelectableRole[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

const RoleSelectionContext = createContext<RoleSelectionValue | null>(null);

interface ProviderProps {
  rolesSectionId: string | null;
  roles: SelectableRole[];
  preselected: string[];
  children: ReactNode;
}

export function RoleSelectionProvider({ rolesSectionId, roles, preselected, children }: ProviderProps) {
  const [selected, setSelected] = useState<string[]>(() =>
    preselected.filter((id) => roles.some((role) => role.id === id)),
  );

  const toggle = useCallback(
    (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [],
  );
  const remove = useCallback((id: string) => setSelected((prev) => prev.filter((x) => x !== id)), []);

  const value = useMemo<RoleSelectionValue>(
    () => ({
      rolesSectionId,
      roles,
      selected,
      selectedRoles: roles.filter((role) => selected.includes(role.id)),
      isSelected: (id) => selected.includes(id),
      toggle,
      remove,
    }),
    [rolesSectionId, roles, selected, toggle, remove],
  );

  return <RoleSelectionContext.Provider value={value}>{children}</RoleSelectionContext.Provider>;
}

/** The page's role selection, or null outside a service page. */
export function useRoleSelection(): RoleSelectionValue | null {
  return useContext(RoleSelectionContext);
}
