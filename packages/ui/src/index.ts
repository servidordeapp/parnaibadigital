/**
 * SC-012 — uma definição por componente, consumida pelo portal e pelo painel.
 *
 * O barril existe para que uma tela nunca importe o caminho interno de um componente:
 * `@parnaibadigital/ui` é a fronteira, e é o que torna a checagem de duplicidade (T110)
 * capaz de afirmar algo. Importar `packages/ui/src/core/Button.astro` direto funcionaria e
 * furaria exatamente a garantia que este arquivo representa.
 *
 * Grupos preservados como na origem do DS (FR-006). As 5 adições justificadas entram
 * marcadas — ver `contracts/component-inventory.md`.
 */

/* ——— core (10 componentes do DS) ——— */
export { default as Badge } from "./core/Badge.astro";
export { default as Button } from "./core/Button.astro";
export { default as Card } from "./core/Card.astro";
export { default as Checkbox } from "./core/Checkbox.astro";
export { default as Icon } from "./core/Icon.astro";
export { default as IconButton } from "./core/IconButton.astro";
export { default as Input } from "./core/Input.astro";
export { default as PhotoFrame } from "./core/PhotoFrame.astro";
export { default as Select } from "./core/Select.astro";
export { default as Tag } from "./core/Tag.astro";

/* ——— brand (1 componente do DS) ——— */
export { default as Wordmark } from "./brand/Wordmark.astro";

/* ——— navigation (Breadcrumb, Tabs, Pagination) ——— */
export { default as Breadcrumb } from "./navigation/Breadcrumb.astro";
export { default as Pagination } from "./navigation/Pagination.astro";
export { default as Tabs } from "./navigation/Tabs.astro";
export type {
  AdminNavItem,
  BreadcrumbItem,
  FooterColumn,
  FooterLink,
  HeaderCity,
  HeaderSection,
  TabItem,
  UrgentHeadline,
} from "./navigation/types";

/* ——— news (9 componentes do DS) ——— */
export { default as AttributionFooter } from "./news/AttributionFooter.astro";
export { default as CurationStamp } from "./news/CurationStamp.astro";
export { default as HeroStory } from "./news/HeroStory.astro";
export { default as NeighborhoodTagBar } from "./news/NeighborhoodTagBar.astro";
export { default as NewsCard } from "./news/NewsCard.astro";
export { default as NewsListItem } from "./news/NewsListItem.astro";
export { default as RegionalContextBox } from "./news/RegionalContextBox.astro";
export { default as SectionHeading } from "./news/SectionHeading.astro";
export { default as ShareBar } from "./news/ShareBar.astro";
export type { ContextItem, ContextLink, NeighborhoodLink } from "./news/types";

/* ——— navigation (os 3 restantes) ——— */
export { default as AdminSidebar } from "./navigation/AdminSidebar.astro";
export { default as SiteFooter } from "./navigation/SiteFooter.astro";
export { default as SiteHeader } from "./navigation/SiteHeader.astro";
export { default as WeatherStrip } from "./navigation/WeatherStrip.astro";

/* ——— widgets (4 componentes do DS) ——— */
export { default as EventList } from "./widgets/EventList.astro";
export { default as JobList } from "./widgets/JobList.astro";
export { default as PharmacyList } from "./widgets/PharmacyList.astro";
export { default as WidgetCard } from "./widgets/WidgetCard.astro";
export type { PharmacyOnDuty } from "./widgets/types";

/* ——— tourism (3 componentes do DS) ——— */
export { default as DestinationCard } from "./tourism/DestinationCard.astro";
export { default as LodgingCard } from "./tourism/LodgingCard.astro";
export { default as LodgingList } from "./tourism/LodgingList.astro";
export type { Destination, Lodging } from "./tourism/types";

/* ——— ads (1 componente do DS) ——— */
export { default as AdSlot } from "./ads/AdSlot.astro";

/* ——— feedback (adição justificada) ——— */
export { default as Skeleton } from "./feedback/Skeleton.astro";

/* ——— overlay (adições justificadas) ——— */
export { default as CommandPalette } from "./overlay/CommandPalette.astro";
export { default as Toast } from "./overlay/Toast.astro";
export { default as NavDrawer } from "./overlay/NavDrawer.astro";
export { initCommandPalette } from "./overlay/command-palette";
export { initNavDrawer } from "./overlay/nav-drawer";
export { initToast, showToast } from "./overlay/toast";
export type { PaletteDestination } from "./overlay/types";

/* ——— data (adição justificada) ——— */
export { default as DataTable } from "./data/DataTable.astro";
export type { DataColumn, DataRow } from "./data/types";

/* ——— tema ——— */
export {
  applyTheme,
  readStoredTheme,
  resolveActiveTheme,
  THEME_INIT_SNIPPET,
  THEME_STORAGE_KEY,
  type ThemeChoice,
} from "./theme/theme-init";
export { initThemeToggle } from "./theme/theme-toggle";

/*
 * Inventário completo: 31 componentes do Design System + 5 adições justificadas
 * (`contracts/component-inventory.md`). `AdminSidebar` é a navegação do painel — não é
 * componente do DS nem adição de inventário, e sim a contraparte de `SiteHeader` para a
 * outra aplicação, com a mesma definição única.
 */
