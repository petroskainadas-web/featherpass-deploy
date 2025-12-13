# Dashboard UX Replication Plan

## Quick Assessment (potential risks before changes)
- Role gating remains client-side; if a token expires mid-session, repeated function calls in analytics or system management could fail noisily until the user refreshes. Consider centralizing session validation with retry/backoff. 【F:src/components/dashboard/hooks/useAnalyticsStats.ts†L4-L26】【F:src/components/dashboard/hooks/useSystemManagement.ts†L1-L129】
- Analytics charts still depend on backend field names; although value fallbacks are broader now, any future schema drift (e.g., `download_count` vs `downloads`) could silently show zeros. Keep the fallbacks aligned with the edge function payloads. 【F:src/components/dashboard/admin/AnalyticsPanel.tsx†L22-L207】

## UX/Feature Gaps vs. Original Dashboard
All major presentation gaps from the monolithic dashboard have been replicated (mode separators, analytics hero cards, contextual metadata on modify lists, and newsletter parity). Continue to validate edge-function outputs against these layouts to ensure data populates every section.

## Planned Adjustments
- Monitor analytics payload shapes during QA to ensure the expanded fallbacks keep charts populated if backend naming changes again.
