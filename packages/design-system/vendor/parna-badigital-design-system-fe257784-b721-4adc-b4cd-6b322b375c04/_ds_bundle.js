/* @ds-bundle: {"format":4,"namespace":"ParnaBaDigitalDesignSystem_fe2577","components":[{"name":"AdSlot","sourcePath":"components/ads/AdSlot.jsx"},{"name":"Wordmark","sourcePath":"components/brand/Wordmark.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"PhotoFrame","sourcePath":"components/core/PhotoFrame.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"Pagination","sourcePath":"components/navigation/Pagination.jsx"},{"name":"SiteFooter","sourcePath":"components/navigation/SiteFooter.jsx"},{"name":"SiteHeader","sourcePath":"components/navigation/SiteHeader.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"WeatherStrip","sourcePath":"components/navigation/WeatherStrip.jsx"},{"name":"AttributionFooter","sourcePath":"components/news/AttributionFooter.jsx"},{"name":"CurationStamp","sourcePath":"components/news/CurationStamp.jsx"},{"name":"HeroStory","sourcePath":"components/news/HeroStory.jsx"},{"name":"NeighborhoodTagBar","sourcePath":"components/news/NeighborhoodTagBar.jsx"},{"name":"NewsCard","sourcePath":"components/news/NewsCard.jsx"},{"name":"NewsListItem","sourcePath":"components/news/NewsListItem.jsx"},{"name":"RegionalContextBox","sourcePath":"components/news/RegionalContextBox.jsx"},{"name":"SectionHeading","sourcePath":"components/news/SectionHeading.jsx"},{"name":"ShareBar","sourcePath":"components/news/ShareBar.jsx"},{"name":"DestinationCard","sourcePath":"components/tourism/DestinationCard.jsx"},{"name":"LodgingCard","sourcePath":"components/tourism/LodgingCard.jsx"},{"name":"LodgingList","sourcePath":"components/tourism/LodgingList.jsx"},{"name":"EventList","sourcePath":"components/widgets/EventList.jsx"},{"name":"JobList","sourcePath":"components/widgets/JobList.jsx"},{"name":"PharmacyList","sourcePath":"components/widgets/PharmacyList.jsx"},{"name":"WidgetCard","sourcePath":"components/widgets/WidgetCard.jsx"}],"sourceHashes":{"components/ads/AdSlot.jsx":"ae8977010f89","components/brand/Wordmark.jsx":"d9c3689de27a","components/core/Badge.jsx":"979bbc13cb0d","components/core/Button.jsx":"b43a373a5dab","components/core/Card.jsx":"34391f53e446","components/core/Checkbox.jsx":"9bf5563c41fb","components/core/Icon.jsx":"95fb8bab1b02","components/core/IconButton.jsx":"4c01223912c4","components/core/Input.jsx":"294c0babb1cb","components/core/PhotoFrame.jsx":"256f89eb8259","components/core/Select.jsx":"55b486e6aac4","components/core/Tag.jsx":"1214927bb801","components/navigation/Breadcrumb.jsx":"c4904cc016a3","components/navigation/Pagination.jsx":"2d56678110e7","components/navigation/SiteFooter.jsx":"545bc8b13580","components/navigation/SiteHeader.jsx":"44f13ebc577d","components/navigation/Tabs.jsx":"127a7d00292b","components/navigation/WeatherStrip.jsx":"8bf740f9406f","components/news/AttributionFooter.jsx":"c646c4290ce5","components/news/CurationStamp.jsx":"804ca76cfc5f","components/news/HeroStory.jsx":"53b79dc9b7d1","components/news/NeighborhoodTagBar.jsx":"018a91eb1ddd","components/news/NewsCard.jsx":"216c7e3fdf94","components/news/NewsListItem.jsx":"26cf0fc2ceae","components/news/RegionalContextBox.jsx":"e3f187ec7f0e","components/news/SectionHeading.jsx":"8fb2ab085575","components/news/ShareBar.jsx":"b2da193186db","components/tourism/DestinationCard.jsx":"c4ea36a725ed","components/tourism/LodgingCard.jsx":"fac1c6654687","components/tourism/LodgingList.jsx":"0df88efa8b96","components/widgets/EventList.jsx":"286f7a0282e0","components/widgets/JobList.jsx":"cf1221fca6e3","components/widgets/PharmacyList.jsx":"d81f731a2641","components/widgets/WidgetCard.jsx":"6a0602e9d96d","ui_kits/portal/BairroScreen.jsx":"c1e888e8ca3a","ui_kits/portal/HomeScreen.jsx":"8fb9a2c5f829","ui_kits/portal/PostScreen.jsx":"66c03e76d81b","ui_kits/portal/ServicesScreen.jsx":"dd87dc4d5e68","ui_kits/portal/data.js":"cb3c590b2736"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ParnaBaDigitalDesignSystem_fe2577 = window.ParnaBaDigitalDesignSystem_fe2577 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/ads/AdSlot.jsx
try { (() => {
const adFormats = {
  leaderboard: {
    w: 728,
    h: 90,
    label: "728×90 · Leaderboard"
  },
  billboard: {
    w: 970,
    h: 250,
    label: "970×250 · Billboard"
  },
  rectangle: {
    w: 336,
    h: 280,
    label: "336×280 · Retângulo grande"
  },
  halfpage: {
    w: 300,
    h: 600,
    label: "300×600 · Meia página"
  },
  inread: {
    w: "100%",
    h: 250,
    label: "In-article responsivo"
  },
  mobileBanner: {
    w: 320,
    h: 100,
    label: "320×100 · Banner mobile"
  }
};

/** Reserved AdSense slot. Always rendered as a labelled grey box so the layout
    holds its ground before the ad loads (zero CLS) and so reviewers can see
    exactly where monetisation sits. Never styled in brand colors. */
function AdSlot({
  format = "leaderboard",
  position,
  sticky,
  note
}) {
  const f = adFormats[format] || adFormats.leaderboard;
  return /*#__PURE__*/React.createElement("div", {
    role: "complementary",
    "aria-label": "Espa\xE7o publicit\xE1rio",
    style: {
      position: sticky ? "sticky" : "static",
      top: sticky ? "calc(var(--header-height) + var(--space-7))" : undefined,
      width: "100%",
      maxWidth: typeof f.w === "number" ? f.w : undefined,
      height: f.h,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-2)",
      background: "var(--surface-ad)",
      border: "1px dashed var(--border-ad)",
      borderRadius: "var(--radius-sm)",
      color: "var(--pd-ad-ink)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase"
    }
  }, "[An\xFAncio AdSense]"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)"
    }
  }, f.label), position ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      opacity: 0.75
    }
  }, position) : null, note ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      opacity: 0.75,
      maxWidth: "36ch"
    }
  }, note) : null);
}
Object.assign(__ds_scope, { AdSlot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ads/AdSlot.jsx", error: String((e && e.message) || e) }); }

// components/brand/Wordmark.jsx
try { (() => {
/** The ParnaíbaDigital wordmark, set in live type (no logo file was supplied).
    "Parnaíba" carries the tech blue voice, "Digital" the sun accent. */
function Wordmark({
  size = 27,
  onDark = false,
  showTagline = false,
  href = "#"
}) {
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      display: "inline-flex",
      flexDirection: "column",
      gap: 2,
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "baseline",
      fontFamily: "var(--font-display)",
      fontWeight: "var(--weight-black)",
      fontSize: size,
      lineHeight: 1,
      letterSpacing: "-0.035em",
      color: onDark ? "var(--text-inverse)" : "var(--pd-blue-900)"
    }
  }, "Parna\xEDba", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--pd-sun-500)"
    }
  }, "Digital"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: size * 0.17,
      height: size * 0.17,
      borderRadius: "50%",
      background: "var(--pd-sun-500)",
      marginLeft: size * 0.07
    }
  })), showTagline ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: onDark ? "var(--text-inverse-muted)" : "var(--text-faint)"
    }
  }, "Not\xEDcia do seu bairro, primeiro") : null);
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Generic surface: hairline border, 10px radius, shadow only on hover when clickable. */
function Card({
  children,
  padding = "var(--space-5)",
  tone = "default",
  interactive,
  href,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    default: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)"
    },
    subtle: {
      background: "var(--surface-subtle)",
      border: "1px solid var(--border-subtle)"
    },
    warm: {
      background: "var(--surface-context)",
      border: "1px solid var(--border-hot)"
    },
    utility: {
      background: "var(--surface-utility)",
      border: "1px solid #b9e4e7"
    },
    dark: {
      background: "var(--surface-header)",
      border: "1px solid rgba(255,255,255,0.12)"
    }
  };
  const t = tones[tone] || tones.default;
  const Tag = href ? "a" : "div";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "block",
      padding,
      borderRadius: "var(--radius-md)",
      textDecoration: "none",
      color: "inherit",
      background: t.background,
      border: t.border,
      boxShadow: interactive && hover ? "var(--shadow-2)" : "var(--shadow-1)",
      transform: interactive && hover ? "translateY(-1px)" : "none",
      transition: "var(--transition-interactive)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LUCIDE_BASE = "https://unpkg.com/lucide-static@0.469.0/icons/";

/** Monochrome glyph from the Lucide static set, masked so it inherits currentColor. */
function Icon({
  name,
  size = 18,
  color = "currentColor",
  title,
  style,
  ...rest
}) {
  const url = LUCIDE_BASE + name + ".svg";
  return /*#__PURE__*/React.createElement("span", _extends({
    role: title ? "img" : undefined,
    "aria-label": title,
    "aria-hidden": title ? undefined : "true",
    title: title,
    style: {
      display: "inline-block",
      flex: "0 0 auto",
      width: size,
      height: size,
      backgroundColor: color,
      WebkitMaskImage: `url("${url}")`,
      maskImage: `url("${url}")`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const badgeTones = {
  urgent: {
    bg: "var(--pd-urgent-600)",
    fg: "var(--text-inverse)"
  },
  brand: {
    bg: "var(--pd-blue-600)",
    fg: "var(--text-inverse)"
  },
  hot: {
    bg: "var(--pd-sun-500)",
    fg: "var(--pd-ink-950)"
  },
  utility: {
    bg: "var(--pd-mar-500)",
    fg: "var(--text-inverse)"
  },
  soft: {
    bg: "var(--pd-blue-100)",
    fg: "var(--pd-blue-800)"
  },
  neutral: {
    bg: "var(--pd-ink-100)",
    fg: "var(--text-muted)"
  },
  outline: {
    bg: "transparent",
    fg: "var(--text-muted)",
    bd: "var(--border-default)"
  }
};

/** Editorial kicker / status label above or over a headline. Mono, uppercase, tiny. */
function Badge({
  children,
  tone = "brand",
  icon,
  dot
}) {
  const t = badgeTones[tone] || badgeTones.brand;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      height: 22,
      padding: "0 var(--space-3)",
      background: t.bg,
      color: t.fg,
      border: t.bd ? "1px solid " + t.bd : "none",
      borderRadius: "var(--radius-xs)",
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      whiteSpace: "nowrap"
    }
  }, dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "var(--radius-pill)",
      background: "currentColor"
    }
  }) : null, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 12
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const btnSizes = {
  sm: {
    padding: "0 var(--space-4)",
    height: 34,
    font: "var(--type-ui-sm)",
    gap: "var(--space-2)",
    icon: 14
  },
  md: {
    padding: "0 var(--space-5)",
    height: 44,
    font: "var(--type-ui)",
    gap: "var(--space-3)",
    icon: 16
  },
  lg: {
    padding: "0 var(--space-7)",
    height: 52,
    font: "var(--weight-bold) var(--size-md)/1.2 var(--font-body)",
    gap: "var(--space-3)",
    icon: 18
  }
};
const btnVariants = {
  primary: {
    background: "var(--surface-brand)",
    color: "var(--text-inverse)",
    border: "1px solid var(--surface-brand)",
    shadow: "var(--shadow-brand-glow)",
    hoverBg: "var(--pd-blue-700)"
  },
  hot: {
    background: "var(--surface-hot)",
    color: "var(--pd-ink-950)",
    border: "1px solid var(--pd-sun-600)",
    shadow: "var(--shadow-hot-glow)",
    hoverBg: "var(--pd-sun-400)"
  },
  secondary: {
    background: "var(--surface-card)",
    color: "var(--text-brand)",
    border: "1px solid var(--pd-blue-200)",
    shadow: "none",
    hoverBg: "var(--pd-blue-50)"
  },
  ghost: {
    background: "transparent",
    color: "var(--text-body)",
    border: "1px solid transparent",
    shadow: "none",
    hoverBg: "var(--pd-ink-100)"
  },
  onDark: {
    background: "rgba(255,255,255,0.12)",
    color: "var(--text-inverse)",
    border: "1px solid rgba(255,255,255,0.24)",
    shadow: "none",
    hoverBg: "rgba(255,255,255,0.2)"
  }
};

/** Primary call-to-action. Minimum 44px tap target at md and up (mobile-first rule). */
function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  block,
  disabled,
  href,
  onClick,
  type = "button",
  ...rest
}) {
  const s = btnSizes[size] || btnSizes.md;
  const v = btnVariants[variant] || btnVariants.primary;
  const [hover, setHover] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    type: href ? undefined : type,
    disabled: href ? undefined : disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setDown(false);
    },
    onMouseDown: () => setDown(true),
    onMouseUp: () => setDown(false),
    style: {
      display: block ? "flex" : "inline-flex",
      width: block ? "100%" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      font: s.font,
      letterSpacing: "var(--tracking-snug)",
      textDecoration: "none",
      borderRadius: "var(--radius-sm)",
      border: v.border,
      background: disabled ? "var(--pd-ink-100)" : hover ? v.hoverBg : v.background,
      borderColor: disabled ? "var(--border-default)" : undefined,
      color: disabled ? "var(--text-faint)" : v.color,
      boxShadow: disabled ? "none" : down ? "none" : v.shadow,
      transform: down && !disabled ? "scale(var(--press-scale))" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "var(--transition-interactive)",
      whiteSpace: "nowrap"
    }
  }, rest), iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: s.icon
  }) : null, children, iconRight ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Opt-in checkbox (newsletter, LGPD consent). Label is always clickable. */
function Checkbox({
  label,
  checked,
  onChange,
  id,
  ...rest
}) {
  const fieldId = id || "pd-check-" + String(label || "opt").replace(/\s+/g, "-").toLowerCase();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-3)",
      cursor: "pointer",
      minHeight: 24
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      flex: "0 0 auto",
      marginTop: 2,
      borderRadius: "var(--radius-xs)",
      border: "1px solid " + (checked ? "var(--surface-brand)" : "var(--border-strong)"),
      background: checked ? "var(--surface-brand)" : "var(--surface-card)",
      transition: "var(--transition-interactive)"
    }
  }, checked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14,
    color: "var(--text-inverse)"
  }) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-muted)"
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const iconBtnTones = {
  neutral: {
    color: "var(--text-muted)",
    hoverBg: "var(--pd-ink-100)",
    hoverColor: "var(--text-strong)"
  },
  brand: {
    color: "var(--text-brand)",
    hoverBg: "var(--pd-blue-50)",
    hoverColor: "var(--pd-blue-600)"
  },
  onDark: {
    color: "var(--text-inverse)",
    hoverBg: "rgba(255,255,255,0.16)",
    hoverColor: "var(--text-inverse)"
  },
  hot: {
    color: "var(--text-hot)",
    hoverBg: "var(--pd-sun-100)",
    hoverColor: "var(--pd-sun-700)"
  }
};

/** Square 44px action for chrome and share bars — icon only, always with a label for a11y. */
function IconButton({
  icon,
  label,
  tone = "neutral",
  size = 44,
  iconSize = 20,
  active,
  onClick,
  href,
  ...rest
}) {
  const t = iconBtnTones[tone] || iconBtnTones.neutral;
  const [hover, setHover] = React.useState(false);
  const Tag = href ? "a" : "button";
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    type: href ? undefined : "button",
    "aria-label": label,
    title: label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "var(--radius-sm)",
      border: "1px solid transparent",
      background: hover || active ? t.hoverBg : "transparent",
      color: hover || active ? t.hoverColor : t.color,
      cursor: "pointer",
      transition: "var(--transition-interactive)"
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: iconSize
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Single-line field used in newsletter, search and WhatsApp opt-in blocks. */
function Input({
  label,
  hint,
  icon,
  error,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fieldId = id || "pd-input-" + (label || placeholder || "field").replace(/\s+/g, "-").toLowerCase();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "block"
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-ui-sm)",
      color: "var(--text-body)",
      marginBottom: "var(--space-2)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      height: 44,
      padding: "0 var(--space-4)",
      background: "var(--surface-card)",
      border: "1px solid " + (error ? "var(--pd-urgent-600)" : focus ? "var(--border-brand)" : "var(--border-default)"),
      borderRadius: "var(--radius-sm)",
      boxShadow: focus ? "var(--focus-ring)" : "none",
      transition: "var(--transition-interactive)"
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17,
    color: "var(--text-faint)"
  }) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--type-body-sm)",
      color: "var(--text-strong)",
      minWidth: 0
    }
  }, rest))), hint || error ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-meta)",
      color: error ? "var(--text-urgent)" : "var(--text-faint)",
      marginTop: "var(--space-2)"
    }
  }, error || hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/PhotoFrame.jsx
try { (() => {
/** Photo frame with a fixed aspect ratio. With no `src` it renders the brand's
    blue placeholder so layouts never collapse before real photography arrives. */
function PhotoFrame({
  src,
  alt = "",
  ratio = "16 / 9",
  radius = "var(--radius-md)",
  label = "Foto",
  credit,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      aspectRatio: ratio,
      borderRadius: radius,
      overflow: "hidden",
      background: "var(--surface-photo-fallback)",
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-2)",
      color: "var(--pd-blue-400)",
      backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0 2px, transparent 2px 9px)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "image",
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase"
    }
  }, label)), credit ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 0,
      bottom: 0,
      padding: "2px var(--space-3)",
      background: "rgba(4,22,44,0.72)",
      color: "var(--text-inverse)",
      font: "var(--type-kicker)"
    }
  }, credit) : null);
}
Object.assign(__ds_scope, { PhotoFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PhotoFrame.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Native select styled to match Input — used for bairro and category filters. */
function Select({
  label,
  options = [],
  value,
  onChange,
  id,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fieldId = id || "pd-select-" + (label || "field").replace(/\s+/g, "-").toLowerCase();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "block"
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-ui-sm)",
      color: "var(--text-body)",
      marginBottom: "var(--space-2)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      height: 44,
      padding: "0 var(--space-4)",
      background: "var(--surface-card)",
      border: "1px solid " + (focus ? "var(--border-brand)" : "var(--border-default)"),
      borderRadius: "var(--radius-sm)",
      boxShadow: focus ? "var(--focus-ring)" : "none",
      transition: "var(--transition-interactive)"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    value: value,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      appearance: "none",
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--type-body-sm)",
      color: "var(--text-strong)",
      cursor: "pointer"
    }
  }, rest), options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16,
    color: "var(--text-muted)"
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
const tagTones = {
  bairro: {
    bg: "var(--pd-blue-50)",
    fg: "var(--pd-blue-700)",
    bd: "var(--pd-blue-200)",
    hoverBg: "var(--pd-blue-600)",
    hoverFg: "var(--text-inverse)"
  },
  hot: {
    bg: "var(--pd-sun-100)",
    fg: "var(--pd-sun-700)",
    bd: "var(--pd-sun-300)",
    hoverBg: "var(--pd-sun-500)",
    hoverFg: "var(--pd-ink-950)"
  },
  neutral: {
    bg: "var(--pd-ink-50)",
    fg: "var(--text-muted)",
    bd: "var(--border-default)",
    hoverBg: "var(--pd-ink-100)",
    hoverFg: "var(--text-strong)"
  },
  onDark: {
    bg: "rgba(255,255,255,0.1)",
    fg: "var(--text-inverse)",
    bd: "rgba(255,255,255,0.22)",
    hoverBg: "var(--pd-sun-500)",
    hoverFg: "var(--pd-ink-950)"
  }
};

/** Geolocated tag — the SEO workhorse. Renders a bairro/city name as a pill link with a pin. */
function Tag({
  children,
  tone = "bairro",
  href = "#",
  pin = true,
  count,
  active,
  size = "md",
  onClick
}) {
  const t = tagTones[tone] || tagTones.bairro;
  const [hover, setHover] = React.useState(false);
  const on = hover || active;
  const small = size === "sm";
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: small ? "var(--space-2)" : "var(--space-3)",
      height: small ? 28 : 36,
      padding: small ? "0 var(--space-3)" : "0 var(--space-4)",
      borderRadius: "var(--radius-pill)",
      border: "1px solid " + (on ? "transparent" : t.bd),
      background: on ? t.hoverBg : t.bg,
      color: on ? t.hoverFg : t.fg,
      font: small ? "var(--type-ui-sm)" : "var(--type-ui)",
      letterSpacing: "var(--tracking-snug)",
      textDecoration: "none",
      transition: "var(--transition-interactive)",
      cursor: "pointer"
    }
  }, pin ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: small ? 12 : 14
  }) : null, children, count != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      opacity: 0.72,
      letterSpacing: "var(--tracking-wide)"
    }
  }, count) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
/** Breadcrumb trail — carries the geo hierarchy (Home › Bairros › São José)
    and doubles as the SEO breadcrumb markup slot. */
function Breadcrumb({
  items = []
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Trilha",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      flexWrap: "wrap",
      font: "var(--type-meta)",
      color: "var(--text-faint)"
    }
  }, items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: it.label
    }, last ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      href: it.href || "#",
      style: {
        color: "var(--text-link)",
        font: "var(--type-meta)"
      }
    }, it.label), !last ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-right",
      size: 12
    }) : null);
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Pagination.jsx
try { (() => {
/** Feed pagination. "Carregar mais" is the primary pattern (more pageviews per
    session); numbered pages stay available for crawlers. */
function Pagination({
  page = 1,
  total = 12,
  onChange,
  onLoadMore
}) {
  const pages = [1, 2, 3].filter(p => p <= total);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-5)",
      padding: "var(--space-7) 0"
    }
  }, onLoadMore ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    size: "lg",
    iconRight: "chevron-down",
    onClick: onLoadMore
  }, "Carregar mais not\xEDcias") : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, pages.map(p => {
    const on = p === page;
    return /*#__PURE__*/React.createElement("button", {
      key: p,
      onClick: () => onChange && onChange(p),
      style: {
        minWidth: 36,
        height: 36,
        borderRadius: "var(--radius-sm)",
        border: "1px solid " + (on ? "var(--surface-brand)" : "var(--border-default)"),
        background: on ? "var(--surface-brand)" : "var(--surface-card)",
        color: on ? "var(--text-inverse)" : "var(--text-muted)",
        font: "var(--type-ui-sm)",
        cursor: "pointer",
        transition: "var(--transition-interactive)"
      }
    }, p);
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      color: "var(--text-faint)",
      padding: "0 var(--space-2)"
    }
  }, "de ", total), /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange && onChange(Math.min(total, page + 1)),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border-default)",
      background: "var(--surface-card)",
      color: "var(--text-muted)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 16
  }))));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteFooter.jsx
try { (() => {
const defaultColumns = [{
  title: "Editorias",
  links: ["Cidade", "Bairros", "Polícia", "Política", "Esporte"]
}, {
  title: "Utilidade pública",
  links: ["Farmácias de plantão", "Vagas de emprego", "Eventos do fim de semana", "Telefones úteis"]
}, {
  title: "Institucional",
  links: ["Quem somos", "Política editorial e de curadoria", "Política de privacidade", "Anuncie", "Contato"]
}];

/** Footer with the transparency statement about the Curadoria Híbrida pipeline —
    required for AdSense policy and for reader trust. */
function SiteFooter({
  columns = defaultColumns,
  year = 2026
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--surface-footer)",
      color: "var(--text-inverse-muted)",
      marginTop: "var(--space-11)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-10) var(--container-gutter) var(--space-7)",
      display: "grid",
      gridTemplateColumns: "1.2fr repeat(3, 1fr)",
      gap: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Wordmark, {
    onDark: true,
    showTagline: true,
    size: 24
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-inverse-muted)",
      margin: "var(--space-5) 0 0",
      maxWidth: "34ch"
    }
  }, "Jornalismo hiperlocal para Parna\xEDba e o Litoral do Piau\xED. Curadoria automatizada com revis\xE3o humana, 24 horas por dia."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      marginTop: "var(--space-5)"
    }
  }, ["instagram", "facebook", "youtube", "message-circle"].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: "var(--radius-sm)",
      background: "rgba(255,255,255,0.08)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: i,
    size: 17,
    color: "var(--text-inverse)"
  }))))), columns.map(c => /*#__PURE__*/React.createElement("nav", {
    key: c.title
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--pd-sun-300)",
      marginBottom: "var(--space-5)"
    }
  }, c.title), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, c.links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-inverse-muted)"
    }
  }, l))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid rgba(255,255,255,0.1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-5) var(--container-gutter)",
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-4)",
      font: "var(--type-meta)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 ", year, " Parna\xEDbaDigital \xB7 Parna\xEDba, Piau\xED"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sparkles",
    size: 12,
    color: "var(--pd-sun-400)"
  }), "Conte\xFAdo curado por automa\xE7\xE3o com supervis\xE3o editorial humana"))));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/** Horizontal filter tabs used on listing pages ("Todas · Hoje · Semana"). */
function Tabs({
  tabs = [],
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: "var(--space-2)",
      borderBottom: "1px solid var(--border-default)"
    }
  }, tabs.map(t => {
    const tab = typeof t === "string" ? {
      value: t,
      label: t
    } : t;
    const on = tab.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(tab.value),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        height: 44,
        padding: "0 var(--space-5)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        font: "var(--type-ui)",
        color: on ? "var(--pd-blue-700)" : "var(--text-muted)",
        boxShadow: on ? "inset 0 -3px 0 var(--pd-blue-600)" : "none",
        transition: "var(--transition-interactive)"
      }
    }, tab.label, tab.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-kicker)",
        color: on ? "var(--pd-blue-600)" : "var(--text-faint)"
      }
    }, tab.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/WeatherStrip.jsx
try { (() => {
/** Compact live-weather chip for the header (Parnaíba is hot and coastal —
    temperature and condition are genuinely useful, not decoration). */
function WeatherStrip({
  temp = 32,
  condition = "Sol com nuvens",
  icon = "sun",
  city = "Parnaíba",
  onDark = true,
  humidity
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "var(--space-2) var(--space-4)",
      borderRadius: "var(--radius-pill)",
      background: onDark ? "rgba(255,255,255,0.1)" : "var(--surface-hot-soft)",
      border: "1px solid " + (onDark ? "rgba(255,255,255,0.18)" : "var(--border-hot)")
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16,
    color: "var(--pd-sun-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-data)",
      color: onDark ? "var(--text-inverse)" : "var(--pd-sun-900)"
    }
  }, temp, "\xB0C"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      color: onDark ? "var(--text-inverse-muted)" : "var(--text-muted)"
    }
  }, city, " \xB7 ", condition, humidity != null ? " · " + humidity + "% umid." : ""));
}
Object.assign(__ds_scope, { WeatherStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/WeatherStrip.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteHeader.jsx
try { (() => {
const defaultSections = ["Cidade", "Bairros", "Polícia", "Política", "Utilidade Pública", "Emprego"];

/** Site chrome: deep-blue bar with wordmark, current date, local weather,
    search and the section nav. Sticky on scroll, 64px tall. */
function SiteHeader({
  date = "Terça, 4 de agosto de 2026",
  sections = defaultSections,
  activeSection = "Cidade",
  onNavigate,
  weather,
  compact = false,
  onSearch
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: "var(--surface-header)",
      boxShadow: "var(--shadow-3)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-header-bar)",
      borderBottom: "1px solid rgba(255,255,255,0.08)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-2) var(--container-gutter)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-meta)",
      color: "var(--text-inverse-muted)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "calendar-days",
    size: 13
  }), date), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.WeatherStrip, weather || {})))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "0 var(--container-gutter)",
      height: "var(--header-height)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Wordmark, {
    onDark: true,
    size: compact ? 22 : 26
  }), !compact ? /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      marginLeft: "var(--space-5)",
      overflowX: "auto"
    }
  }, sections.map(s => {
    const on = s === activeSection;
    return /*#__PURE__*/React.createElement("a", {
      key: s,
      href: "#",
      onClick: onNavigate ? e => {
        e.preventDefault();
        onNavigate(s);
      } : undefined,
      style: {
        padding: "var(--space-3) var(--space-4)",
        font: "var(--type-ui)",
        color: on ? "var(--pd-sun-300)" : "var(--text-inverse)",
        textDecoration: "none",
        borderBottom: "3px solid " + (on ? "var(--pd-sun-500)" : "transparent"),
        whiteSpace: "nowrap",
        transition: "var(--transition-interactive)"
      }
    }, s);
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "search",
    label: "Buscar",
    tone: "onDark",
    onClick: onSearch
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "menu",
    label: "Menu",
    tone: "onDark"
  }))));
}
Object.assign(__ds_scope, { SiteHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// components/news/AttributionFooter.jsx
try { (() => {
/** Rodapé de Atribuição Legal — mandatory closing block of every curated post.
    Discreet but legible: 13px, muted, with a real outbound link to the source. */
function AttributionFooter({
  source,
  sourceHref = "#",
  author,
  publishedAt,
  reviewedBy = "Redação ParnaíbaDigital"
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: "var(--space-8)",
      padding: "var(--space-5)",
      background: "var(--surface-subtle)",
      borderTop: "3px solid var(--pd-blue-600)",
      borderRadius: "0 0 var(--radius-sm) var(--radius-sm)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--type-body-sm)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "link-2",
    size: 13,
    style: {
      marginRight: 6,
      verticalAlign: "-2px"
    }
  }), "Informa\xE7\xF5es originais publicadas por", " ", /*#__PURE__*/React.createElement("a", {
    href: sourceHref,
    rel: "nofollow noopener",
    style: {
      font: "var(--type-ui-sm)",
      color: "var(--text-link)"
    }
  }, source), author ? " · " + author : "", ". Leia a mat\xE9ria completa na fonte."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-3) 0 0",
      font: "var(--type-meta)",
      color: "var(--text-faint)"
    }
  }, "Curadoria automatizada com revis\xE3o humana", reviewedBy ? " · " + reviewedBy : "", publishedAt ? " · publicado em " + publishedAt : ""));
}
Object.assign(__ds_scope, { AttributionFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/AttributionFooter.jsx", error: String((e && e.message) || e) }); }

// components/news/CurationStamp.jsx
try { (() => {
/** Transparency stamp for the Curadoria Híbrida pipeline: says the item was
    machine-curated and human-reviewed, and how fresh it is. Never hide it. */
function CurationStamp({
  minutes = 8,
  reviewed = true,
  tone = "light",
  showLabel = true
}) {
  const dark = tone === "dark";
  const fg = dark ? "var(--text-inverse-muted)" : "var(--text-faint)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      font: "var(--type-meta)",
      color: fg,
      letterSpacing: "var(--tracking-normal)"
    }
  }, showLabel ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      padding: "2px var(--space-3) 2px var(--space-2)",
      borderRadius: "var(--radius-pill)",
      border: "1px solid " + (dark ? "rgba(255,255,255,0.24)" : "var(--pd-blue-200)"),
      background: dark ? "rgba(255,255,255,0.08)" : "var(--pd-blue-50)",
      color: dark ? "var(--text-inverse)" : "var(--pd-blue-700)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "sparkles",
    size: 12
  }), "Curadoria Inteligente", reviewed ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "badge-check",
    size: 12,
    color: dark ? "var(--pd-sun-400)" : "var(--pd-success-600)"
  }) : null) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: minutes <= 15 ? "var(--pd-success-600)" : "var(--pd-ink-300)"
    }
  }), "Atualizado h\xE1 ", minutes, " min"));
}
Object.assign(__ds_scope, { CurationStamp });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/CurationStamp.jsx", error: String((e && e.message) || e) }); }

// components/news/HeroStory.jsx
try { (() => {
/** Manchete principal: full-bleed photo, protection scrim, headline over image.
    One per page, always above the fold, always with the bairro in the kicker. */
function HeroStory({
  bairro,
  headline,
  summary,
  kicker = "Destaque",
  minutes = 5,
  photo,
  href = "#",
  height = 420
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      display: "flex",
      alignItems: "flex-end",
      minHeight: height,
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      background: "var(--pd-blue-800)",
      boxShadow: hover ? "var(--shadow-2)" : "var(--shadow-1)",
      textDecoration: "none",
      transition: "var(--transition-interactive)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: photo ? "url(" + photo + ") center/cover no-repeat" : "linear-gradient(140deg, var(--pd-blue-800), var(--pd-blue-600) 58%, var(--pd-sun-600))",
      transform: hover ? "scale(1.02)" : "none",
      transition: "transform var(--dur-slow) var(--ease-out)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--scrim-photo)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      padding: "var(--space-7)",
      paddingTop: "var(--space-10)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "hot"
  }, kicker), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--pd-sun-300)"
    }
  }, bairro)), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--type-hero)",
      color: "var(--text-inverse)",
      maxWidth: "18ch",
      textWrap: "balance"
    }
  }, headline), summary ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-inverse-muted)",
      margin: 0,
      maxWidth: "52ch"
    }
  }, summary) : null, /*#__PURE__*/React.createElement(__ds_scope.CurationStamp, {
    minutes: minutes,
    tone: "dark"
  })));
}
Object.assign(__ds_scope, { HeroStory });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/HeroStory.jsx", error: String((e && e.message) || e) }); }

// components/news/NeighborhoodTagBar.jsx
try { (() => {
/** "Topo em destaque": the geolocated SEO block. Horizontally scrollable on
    mobile, wrapped on desktop. Feed it the bairros with fresh stories first. */
function NeighborhoodTagBar({
  title = "Seu bairro agora",
  bairros = [],
  tone = "bairro",
  activeBairro,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "var(--space-5)",
      background: "var(--surface-subtle)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      marginBottom: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pinned",
    size: 16,
    color: "var(--pd-blue-600)"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: "var(--type-section)",
      color: "var(--text-strong)"
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      color: "var(--text-faint)",
      marginLeft: "auto"
    }
  }, "SEO local")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-3)"
    }
  }, bairros.map(b => {
    const item = typeof b === "string" ? {
      name: b
    } : b;
    return /*#__PURE__*/React.createElement(__ds_scope.Tag, {
      key: item.name,
      tone: tone,
      count: item.count,
      active: activeBairro === item.name,
      onClick: onSelect ? e => {
        e.preventDefault();
        onSelect(item.name);
      } : undefined
    }, item.name);
  })));
}
Object.assign(__ds_scope, { NeighborhoodTagBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/NeighborhoodTagBar.jsx", error: String((e && e.message) || e) }); }

// components/news/NewsCard.jsx
try { (() => {
/** Standard grid card. Headline MUST be written "[Bairro] + fato" — the bairro
    is split out visually so the geo signal reads in a half-second scan. */
function NewsCard({
  bairro,
  headline,
  summary,
  kicker,
  kickerTone = "brand",
  minutes = 12,
  photo,
  layout = "stacked",
  href = "#",
  ratio = "16 / 9"
}) {
  const [hover, setHover] = React.useState(false);
  const row = layout === "row";
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: row ? "grid" : "block",
      gridTemplateColumns: row ? "168px 1fr" : undefined,
      gap: row ? "var(--space-5)" : 0,
      padding: "var(--space-4)",
      background: hover ? "var(--surface-card-hover)" : "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      boxShadow: hover ? "var(--shadow-2)" : "var(--shadow-1)",
      transform: hover ? "translateY(-1px)" : "none",
      transition: "var(--transition-interactive)",
      textDecoration: "none",
      color: "inherit"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: photo,
    ratio: row ? "4 / 3" : ratio,
    radius: "var(--radius-sm)",
    style: row ? undefined : {
      marginBottom: "var(--space-4)"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      marginBottom: "var(--space-3)"
    }
  }, kicker ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: kickerTone
  }, kicker) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--text-hot)"
    }
  }, bairro)), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: row ? "var(--type-headline-sm)" : "var(--type-headline-md)",
      color: hover ? "var(--pd-blue-700)" : "var(--text-strong)",
      marginBottom: "var(--space-3)",
      textWrap: "pretty",
      transition: "color var(--dur-fast) var(--ease-out)"
    }
  }, headline), summary ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-muted)",
      margin: "0 0 var(--space-4)"
    }
  }, summary) : null, /*#__PURE__*/React.createElement(__ds_scope.CurationStamp, {
    minutes: minutes,
    showLabel: !row
  })));
}
Object.assign(__ds_scope, { NewsCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/NewsCard.jsx", error: String((e && e.message) || e) }); }

// components/news/NewsListItem.jsx
try { (() => {
/** Dense list row for "Últimas" columns and infinite feeds. Numbered variant
    is used for the most-read list. */
function NewsListItem({
  bairro,
  headline,
  minutes = 20,
  index,
  photo,
  href = "#",
  showPhoto = true
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "grid",
      gridTemplateColumns: (index != null ? "28px " : "") + (showPhoto ? "84px " : "") + "1fr",
      gap: "var(--space-4)",
      alignItems: "start",
      padding: "var(--space-4) var(--space-2)",
      borderBottom: "1px solid var(--border-subtle)",
      background: hover ? "var(--surface-subtle)" : "transparent",
      textDecoration: "none",
      color: "inherit",
      transition: "background-color var(--dur-fast) var(--ease-out)"
    }
  }, index != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-bold) var(--size-xl)/1 var(--font-display)",
      color: "var(--pd-sun-500)"
    }
  }, index) : null, showPhoto ? /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: photo,
    ratio: "1 / 1",
    radius: "var(--radius-sm)",
    label: ""
  }) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--text-hot)",
      marginBottom: "var(--space-2)"
    }
  }, bairro), /*#__PURE__*/React.createElement("h4", {
    style: {
      font: "var(--weight-semibold) var(--size-sm)/1.3 var(--font-display)",
      color: hover ? "var(--pd-blue-700)" : "var(--text-strong)",
      marginBottom: "var(--space-2)",
      textWrap: "pretty"
    }
  }, headline), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      color: "var(--text-faint)"
    }
  }, "h\xE1 ", minutes, " min")));
}
Object.assign(__ds_scope, { NewsListItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/NewsListItem.jsx", error: String((e && e.message) || e) }); }

// components/news/RegionalContextBox.jsx
try { (() => {
/** "Bloco de Contexto Regional" inside a post: fixed, machine-maintained local
    data (emergency numbers, service links, bairro map) on a warm surface. */
function RegionalContextBox({
  title = "Contexto do bairro",
  bairro,
  items = [],
  links = [],
  mapLabel
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      margin: "var(--space-8) 0",
      padding: "var(--space-6)",
      background: "var(--surface-context)",
      border: "1px solid var(--border-hot)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      marginBottom: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "life-buoy",
    size: 18,
    color: "var(--pd-sun-700)"
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-headline-sm)",
      color: "var(--pd-sun-900)"
    }
  }, title, bairro ? " · " + bairro : "")), /*#__PURE__*/React.createElement("dl", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "var(--space-4) var(--space-6)",
      margin: 0
    }
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.label,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--pd-sun-700)"
    }
  }, it.label), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      font: "var(--type-data)",
      color: "var(--pd-ink-900)"
    }
  }, it.value)))), links.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-4)",
      marginTop: "var(--space-5)",
      paddingTop: "var(--space-4)",
      borderTop: "1px solid var(--pd-sun-300)"
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href || "#",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-ui-sm)",
      color: "var(--pd-sun-900)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "external-link",
    size: 13
  }), l.label))) : null, mapLabel ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)",
      height: 132,
      borderRadius: "var(--radius-sm)",
      border: "1px dashed var(--pd-sun-300)",
      background: "repeating-linear-gradient(135deg, rgba(245,130,32,0.09) 0 3px, transparent 3px 12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-3)",
      color: "var(--pd-sun-700)",
      font: "var(--type-meta)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map",
    size: 16
  }), mapLabel) : null);
}
Object.assign(__ds_scope, { RegionalContextBox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/RegionalContextBox.jsx", error: String((e && e.message) || e) }); }

// components/news/SectionHeading.jsx
try { (() => {
/** Section title with the brand's 3px sun rule and an optional "ver tudo" link. */
function SectionHeading({
  children,
  linkLabel,
  href = "#",
  accent = "sun",
  level = "h2"
}) {
  const Tag = level;
  const rule = accent === "blue" ? "var(--pd-blue-600)" : "var(--pd-sun-500)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      paddingBottom: "var(--space-3)",
      borderBottom: "1px solid var(--border-default)",
      marginBottom: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 4,
      height: 20,
      background: rule,
      borderRadius: "var(--radius-xs)"
    }
  }), /*#__PURE__*/React.createElement(Tag, {
    style: {
      font: "var(--type-headline-md)",
      color: "var(--text-strong)",
      letterSpacing: "var(--tracking-snug)"
    }
  }, children), linkLabel ? /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-ui-sm)",
      color: "var(--text-link)"
    }
  }, linkLabel, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-right",
    size: 14
  })) : null);
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/news/ShareBar.jsx
try { (() => {
/** Share row for posts. WhatsApp first — it is the dominant sharing channel
    for regional audiences in Piauí. */
function ShareBar({
  label = "Compartilhe no seu grupo",
  compact = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      flexWrap: "wrap",
      padding: "var(--space-4) 0",
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, !compact ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-ui-sm)",
      color: "var(--text-muted)",
      marginRight: "var(--space-2)"
    }
  }, label) : null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "hot",
    iconLeft: "message-circle"
  }, "WhatsApp"), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "facebook",
    label: "Compartilhar no Facebook",
    size: 36,
    iconSize: 17
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "send",
    label: "Enviar no Telegram",
    size: 36,
    iconSize: 17
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "copy",
    label: "Copiar link",
    size: 36,
    iconSize: 17
  }));
}
Object.assign(__ds_scope, { ShareBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/news/ShareBar.jsx", error: String((e && e.message) || e) }); }

// components/tourism/DestinationCard.jsx
try { (() => {
/** Destino de lazer (praia, passeio, natureza, cultura) em card-foto com sobreposição.
    Curto por natureza: nome, categoria e a informação prática de deslocamento. */
function DestinationCard({
  name,
  category = "Passeio",
  photo,
  distance,
  tip,
  href = "#",
  ratio = "3 / 4"
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      display: "block",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      boxShadow: hover ? "var(--shadow-3)" : "var(--shadow-1)",
      transform: hover ? "translateY(-2px)" : "none",
      transition: "var(--transition-interactive)",
      textDecoration: "none",
      color: "var(--text-inverse)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: photo,
    ratio: ratio,
    radius: "0",
    label: category
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to top, rgba(4,22,44,0.88) 0%, rgba(4,22,44,0.35) 42%, rgba(4,22,44,0) 72%)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "var(--space-3)",
      left: "var(--space-3)",
      padding: "0 var(--space-3)",
      height: 22,
      display: "inline-flex",
      alignItems: "center",
      background: "var(--pd-sun-500)",
      color: "var(--pd-ink-950)",
      borderRadius: "var(--radius-xs)",
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase"
    }
  }, category), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      padding: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-headline-sm)",
      textWrap: "pretty"
    }
  }, name), distance ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-meta)",
      color: "var(--pd-sun-300)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "navigation",
    size: 11
  }), distance) : null, tip ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--text-inverse-muted)"
    }
  }, tip) : null));
}
Object.assign(__ds_scope, { DestinationCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tourism/DestinationCard.jsx", error: String((e && e.message) || e) }); }

// components/tourism/LodgingCard.jsx
try { (() => {
const amenityIcons = {
  wifi: "wifi",
  "ar-condicionado": "snowflake",
  piscina: "waves",
  "cafe-da-manha": "coffee",
  estacionamento: "car",
  restaurante: "utensils",
  "pet-friendly": "dog",
  "pe-na-areia": "sun",
  academia: "dumbbell",
  bicicleta: "bike",
  "passeio-de-barco": "ship",
  "vista-para-o-rio": "waves",
  familia: "users",
  camping: "tent"
};
const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

/** Hospedagem da rede parceira: foto, tipo, bairro/região, diária a partir de,
    nota e comodidades. Preço é dado — sempre mono. */
function LodgingCard({
  name,
  type = "Pousada",
  bairro,
  area,
  photo,
  priceFrom,
  priceUnit = "/noite",
  rating,
  reviews,
  amenities = [],
  phone,
  whatsapp,
  href = "#",
  featured = false
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("article", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-card)",
      border: "1px solid " + (featured ? "var(--border-hot)" : "var(--border-subtle)"),
      borderRadius: "var(--radius-md)",
      boxShadow: hover ? "var(--shadow-2)" : "var(--shadow-1)",
      transform: hover ? "translateY(-1px)" : "none",
      transition: "var(--transition-interactive)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PhotoFrame, {
    src: photo,
    ratio: "4 / 3",
    radius: "0",
    label: "Hospedagem"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "var(--space-3)",
      left: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: featured ? "hot" : "brand",
    icon: "bed-double"
  }, type)), priceFrom ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: "var(--space-3)",
      bottom: "var(--space-3)",
      display: "inline-flex",
      alignItems: "baseline",
      gap: 3,
      padding: "var(--space-2) var(--space-3)",
      background: "var(--pd-blue-950)",
      color: "var(--text-inverse)",
      borderRadius: "var(--radius-xs)",
      font: "var(--type-data)"
    }
  }, priceFrom, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      opacity: 0.7
    }
  }, priceUnit)) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      padding: "var(--space-4)",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      font: "var(--type-headline-sm)",
      color: hover ? "var(--pd-blue-700)" : "var(--text-strong)",
      textDecoration: "none",
      textWrap: "pretty",
      transition: "color var(--dur-fast) var(--ease-out)"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-meta)",
      color: "var(--text-hot)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 11
  }), [bairro, area].filter(Boolean).join(" · ")), rating != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-data)",
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "star",
    size: 13,
    color: "var(--pd-sun-500)"
  }), rating.toFixed(1).replace(".", ","), reviews != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      color: "var(--text-faint)"
    }
  }, reviews, " avalia\xE7\xF5es") : null) : null, amenities.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-3)"
    }
  }, amenities.slice(0, 4).map(a => {
    const label = typeof a === "string" ? a : a.label;
    const icon = typeof a === "object" && a.icon || amenityIcons[slug(label)] || "check";
    return /*#__PURE__*/React.createElement("li", {
      key: label,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        font: "var(--type-body-sm)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: icon,
      size: 13,
      color: "var(--pd-mar-700)"
    }), label);
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      marginTop: "auto",
      paddingTop: "var(--space-3)",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, phone ? /*#__PURE__*/React.createElement("a", {
    href: "tel:" + String(phone).replace(/\D/g, ""),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-data)",
      color: "var(--pd-blue-700)",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "phone",
    size: 13
  }), phone) : null, whatsapp ? /*#__PURE__*/React.createElement("a", {
    href: whatsapp,
    style: {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      height: 30,
      padding: "0 var(--space-4)",
      borderRadius: "var(--radius-pill)",
      background: "var(--pd-mar-500)",
      color: "var(--text-inverse)",
      font: "var(--type-ui-sm)",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "message-circle",
    size: 13
  }), "Reservar") : null)));
}
Object.assign(__ds_scope, { LodgingCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tourism/LodgingCard.jsx", error: String((e && e.message) || e) }); }

// components/widgets/WidgetCard.jsx
try { (() => {
/** Shell for every automated public-utility widget: sea-teal header strip,
    freshness line, optional footer link. Widgets are data, so type is mono. */
function WidgetCard({
  title,
  icon = "info",
  children,
  updatedLabel = "Atualizado automaticamente hoje",
  footerLabel,
  footerHref = "#",
  accent = "utility"
}) {
  const accents = {
    utility: {
      bar: "var(--pd-mar-500)",
      soft: "var(--pd-mar-100)",
      ink: "var(--pd-mar-700)"
    },
    brand: {
      bar: "var(--pd-blue-600)",
      soft: "var(--pd-blue-50)",
      ink: "var(--pd-blue-700)"
    },
    hot: {
      bar: "var(--pd-sun-500)",
      soft: "var(--pd-sun-50)",
      ink: "var(--pd-sun-700)"
    }
  };
  const a = accents[accent] || accents.utility;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-1)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "var(--space-4) var(--space-5)",
      background: a.soft,
      borderBottom: "2px solid " + a.bar
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17,
    color: a.ink
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-headline-sm)",
      color: a.ink
    }
  }, title)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4) var(--space-5)"
    }
  }, children), /*#__PURE__*/React.createElement("footer", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "var(--space-3) var(--space-5)",
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--surface-subtle)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "refresh-cw",
    size: 12,
    color: "var(--text-faint)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      color: "var(--text-faint)"
    }
  }, updatedLabel), footerLabel ? /*#__PURE__*/React.createElement("a", {
    href: footerHref,
    style: {
      marginLeft: "auto",
      font: "var(--type-ui-sm)",
      color: "var(--text-link)"
    }
  }, footerLabel) : null));
}
Object.assign(__ds_scope, { WidgetCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/widgets/WidgetCard.jsx", error: String((e && e.message) || e) }); }

// components/tourism/LodgingList.jsx
try { (() => {
/** "Onde ficar" — recorte curto da rede de hospedagem para a sidebar. */
function LodgingList({
  items = [],
  title = "Onde ficar em Parnaíba",
  footerLabel = "Ver rede de hospedagem",
  updatedLabel = "Tarifas informadas pelas hospedagens"
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.WidgetCard, {
    title: title,
    icon: "bed-double",
    accent: "brand",
    footerLabel: footerLabel,
    updatedLabel: updatedLabel
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, items.map((h, i) => /*#__PURE__*/React.createElement("li", {
    key: h.name,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "var(--space-4) 0",
      borderTop: i ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-ui)",
      color: "var(--text-strong)"
    }
  }, h.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-meta)",
      color: "var(--text-hot)",
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 11
  }), [h.type, h.bairro].filter(Boolean).join(" · "))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      whiteSpace: "nowrap"
    }
  }, h.priceFrom ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-data)",
      color: "var(--pd-blue-700)"
    }
  }, h.priceFrom) : null, h.rating != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      font: "var(--type-meta)",
      color: "var(--text-faint)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "star",
    size: 10,
    color: "var(--pd-sun-500)"
  }), h.rating.toFixed(1).replace(".", ",")) : null)))));
}
Object.assign(__ds_scope, { LodgingList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tourism/LodgingList.jsx", error: String((e && e.message) || e) }); }

// components/widgets/EventList.jsx
try { (() => {
/** "Eventos do Fim de Semana" — mini calendar: day chip + event + place. */
function EventList({
  items = [],
  footerLabel = "Agenda completa",
  title = "Eventos do fim de semana"
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.WidgetCard, {
    title: title,
    icon: "calendar-days",
    accent: "hot",
    footerLabel: footerLabel,
    updatedLabel: "Agenda revisada sexta, 10h"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, items.map((e, i) => /*#__PURE__*/React.createElement("li", {
    key: e.title + i,
    style: {
      display: "grid",
      gridTemplateColumns: "48px 1fr",
      gap: "var(--space-4)",
      padding: "var(--space-4) 0",
      borderTop: i ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-2) 0",
      borderRadius: "var(--radius-sm)",
      background: "var(--pd-sun-100)",
      border: "1px solid var(--pd-sun-300)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--weight-bold) var(--size-lg)/1 var(--font-display)",
      color: "var(--pd-sun-900)"
    }
  }, e.day), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--pd-sun-700)"
    }
  }, e.weekday)), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-ui)",
      color: "var(--text-strong)"
    }
  }, e.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      font: "var(--type-meta)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 11
  }), e.time), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      color: "var(--text-hot)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 11
  }), e.place)))))));
}
Object.assign(__ds_scope, { EventList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/widgets/EventList.jsx", error: String((e && e.message) || e) }); }

// components/widgets/JobList.jsx
try { (() => {
/** "Vagas de Emprego Locais" — cargo + bairro is the whole value proposition. */
function JobList({
  items = [],
  footerLabel = "Todas as vagas em Parnaíba",
  count
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.WidgetCard, {
    title: "Vagas de emprego locais",
    icon: "briefcase",
    accent: "brand",
    footerLabel: footerLabel,
    updatedLabel: (count != null ? count + " vagas · " : "") + "coletadas hoje"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, items.map((j, i) => /*#__PURE__*/React.createElement("li", {
    key: j.role + i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "var(--space-4) 0",
      borderTop: i ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-ui)",
      color: "var(--text-strong)"
    }
  }, j.role), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      font: "var(--type-meta)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      color: "var(--text-hot)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 11
  }), j.bairro), j.company ? /*#__PURE__*/React.createElement("span", null, j.company) : null)), j.salary ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "soft"
  }, j.salary) : null, j.isNew ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "hot"
  }, "nova") : null))));
}
Object.assign(__ds_scope, { JobList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/widgets/JobList.jsx", error: String((e && e.message) || e) }); }

// components/widgets/PharmacyList.jsx
try { (() => {
/** "Farmácias de Plantão" — one day, one list, phone tappable. */
function PharmacyList({
  date = "hoje, 4/8",
  items = [],
  footerLabel = "Ver escala do mês"
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.WidgetCard, {
    title: "Farmácias de plantão · " + date,
    icon: "pill",
    footerLabel: footerLabel
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, items.map((p, i) => /*#__PURE__*/React.createElement("li", {
    key: p.name,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "var(--space-4) 0",
      borderTop: i ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-ui)",
      color: "var(--text-strong)"
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-body-sm)",
      color: "var(--text-muted)"
    }
  }, p.address), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-meta)",
      color: "var(--text-hot)",
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 11
  }), p.bairro, p.hours ? " · " + p.hours : "")), /*#__PURE__*/React.createElement("a", {
    href: "tel:" + String(p.phone || "").replace(/\D/g, ""),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-data)",
      color: "var(--pd-mar-700)",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "phone",
    size: 13
  }), p.phone)))));
}
Object.assign(__ds_scope, { PharmacyList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/widgets/PharmacyList.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/BairroScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PDB = window.ParnaBaDigitalDesignSystem_fe2577;
function BairroScreen({
  mobile,
  bairro = "São José",
  onOpenPost,
  onOpenBairro
}) {
  const {
    Breadcrumb,
    Tabs,
    NewsCard,
    NewsListItem,
    SectionHeading,
    AdSlot,
    JobList,
    PharmacyList,
    Pagination,
    Select,
    Icon,
    Card,
    NeighborhoodTagBar
  } = PDB;
  const d = window.PD_DATA;
  const [tab, setTab] = React.useState("hoje");
  const open = e => {
    if (e) e.preventDefault();
    onOpenPost && onOpenPost();
  };
  const list = d.stories.filter(s => s.bairro === bairro).concat(d.stories).slice(0, 6);
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: mobile ? "var(--space-5) var(--space-4) 0" : "var(--space-7) var(--container-gutter) 0"
    }
  }, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: "Home",
      href: "#"
    }, {
      label: "Bairros",
      href: "#"
    }, {
      label: bairro
    }]
  }), /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "flex-end",
      gap: "var(--space-5)",
      margin: "var(--space-5) 0 var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--text-hot)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 13
  }), " Bairro \xB7 Parna\xEDba, PI"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--type-headline-xl)",
      color: "var(--text-strong)",
      marginTop: "var(--space-3)"
    }
  }, "Not\xEDcias de ", bairro)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: mobile ? 0 : "auto",
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Trocar de bairro",
    value: bairro,
    options: d.bairros.map(b => b.name),
    onChange: e => onOpenBairro && onOpenBairro(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: mobile ? "mobileBanner" : "leaderboard",
    position: "Topo da página de " + bairro
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "minmax(0, 1fr) var(--sidebar-width)",
      gap: "var(--grid-gap)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(Tabs, {
    tabs: [{
      value: "hoje",
      label: "Hoje",
      count: 9
    }, {
      value: "semana",
      label: "Semana",
      count: 31
    }, {
      value: "servicos",
      label: "Serviços"
    }, {
      value: "todas",
      label: "Todas",
      count: 48
    }],
    value: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      margin: "var(--space-6) 0"
    }
  }, list.slice(0, 3).map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.headline + i,
    onClick: open
  }, /*#__PURE__*/React.createElement(NewsCard, _extends({
    layout: "row"
  }, s))))), /*#__PURE__*/React.createElement(AdSlot, {
    format: "inread",
    position: "Entre blocos da listagem"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      margin: "var(--space-6) 0 0"
    }
  }, list.slice(3, 6).map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.headline + i,
    onClick: open
  }, /*#__PURE__*/React.createElement(NewsCard, _extends({
    layout: "row"
  }, s))))), /*#__PURE__*/React.createElement(Pagination, {
    page: 1,
    total: 5,
    onLoadMore: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(NeighborhoodTagBar, {
    title: "Bairros vizinhos",
    bairros: d.bairros.filter(b => b.name !== bairro).slice(0, 6),
    onSelect: onOpenBairro
  }))), /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: "rectangle",
    position: "Sidebar"
  }), /*#__PURE__*/React.createElement(Card, {
    tone: "warm"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--pd-sun-700)"
    }
  }, "Servi\xE7o no bairro"), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-headline-sm)",
      color: "var(--pd-sun-900)",
      margin: "var(--space-3) 0 var(--space-4)"
    }
  }, "Coleta de lixo em ", bairro), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body-sm)",
      color: "var(--pd-ink-800)",
      margin: 0
    }
  }, "Segunda, quarta e sexta a partir das 6h. Seletiva na ter\xE7a, das 14h \xE0s 18h.")), /*#__PURE__*/React.createElement(JobList, {
    count: 9,
    items: d.jobs.slice(0, 3),
    footerLabel: "Vagas em " + bairro
  }), /*#__PURE__*/React.createElement(PharmacyList, {
    date: "hoje, 4/8",
    items: d.pharmacies.slice(0, 2)
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    accent: "blue"
  }, "Mais lidas do bairro"), d.mostRead.slice(0, 3).map((s, i) => /*#__PURE__*/React.createElement(NewsListItem, _extends({
    key: s.headline,
    index: i + 1,
    showPhoto: false
  }, s, {
    onClick: open
  })))))));
}
Object.assign(window, {
  BairroScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/BairroScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/HomeScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PD = window.ParnaBaDigitalDesignSystem_fe2577;
function HomeScreen({
  mobile,
  onOpenPost,
  onOpenBairro
}) {
  const {
    HeroStory,
    NewsCard,
    NewsListItem,
    NeighborhoodTagBar,
    SectionHeading,
    AdSlot,
    PharmacyList,
    JobList,
    EventList,
    Pagination,
    Card,
    Button,
    Input,
    Checkbox,
    Icon
  } = PD;
  const d = window.PD_DATA;
  const [visible, setVisible] = React.useState(6);
  const [optin, setOptin] = React.useState(true);
  const open = e => {
    if (e) e.preventDefault();
    onOpenPost && onOpenPost();
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: mobile ? "var(--space-5) var(--space-4) 0" : "var(--space-7) var(--container-gutter) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: mobile ? "mobileBanner" : "leaderboard",
    position: "Topo da home"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr 300px",
      gap: "var(--grid-gap)",
      alignItems: "start",
      marginBottom: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: open
  }, /*#__PURE__*/React.createElement(HeroStory, _extends({}, d.hero, {
    height: mobile ? 320 : 420
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    accent: "blue"
  }, "Mais lidas agora"), d.mostRead.map((s, i) => /*#__PURE__*/React.createElement(NewsListItem, _extends({
    key: s.headline,
    index: i + 1,
    showPhoto: false
  }, s, {
    href: "#",
    onClick: open
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(NeighborhoodTagBar, {
    bairros: d.bairros,
    onSelect: onOpenBairro
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr var(--sidebar-width)",
      gap: "var(--grid-gap)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionHeading, {
    linkLabel: "Ver todas as editorias"
  }, "\xDAltimas do seu bairro"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      gap: "var(--grid-gap-tight)"
    }
  }, d.stories.slice(0, 4).map(s => /*#__PURE__*/React.createElement("div", {
    key: s.headline,
    onClick: open
  }, /*#__PURE__*/React.createElement(NewsCard, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "var(--space-7) 0"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: "inread",
    position: "Entre blocos de not\xEDcias",
    note: "Slot in-feed depois do 4\xBA card"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      gap: "var(--grid-gap-tight)"
    }
  }, d.stories.slice(4, visible + 2).map(s => /*#__PURE__*/React.createElement("div", {
    key: s.headline,
    onClick: open
  }, /*#__PURE__*/React.createElement(NewsCard, s)))), /*#__PURE__*/React.createElement(Pagination, {
    page: 1,
    total: 12,
    onLoadMore: () => setVisible(6)
  }), /*#__PURE__*/React.createElement(Card, {
    tone: "dark",
    padding: "var(--space-6)",
    style: {
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--pd-sun-300)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mail",
    size: 13
  }), " Resumo di\xE1rio"), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: "var(--type-headline-md)",
      color: "var(--text-inverse)",
      margin: "var(--space-3) 0 var(--space-5)"
    }
  }, "As not\xEDcias do seu bairro no seu e-mail, todos os dias \xE0s 7h"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr auto",
      gap: "var(--space-4)",
      alignItems: "end"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "voce@email.com",
    icon: "mail"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "hot",
    size: "lg"
  }, "Quero receber")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: optin,
    onChange: () => setOptin(!optin),
    label: /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-inverse-muted)"
      }
    }, "Aceito receber o resumo di\xE1rio e concordo com a pol\xEDtica de privacidade.")
  })))), /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: "rectangle",
    position: "Sidebar \xB7 topo"
  }), /*#__PURE__*/React.createElement(PharmacyList, {
    date: "hoje, 4/8",
    items: d.pharmacies
  }), /*#__PURE__*/React.createElement(JobList, {
    count: 23,
    items: d.jobs.slice(0, 3)
  }), /*#__PURE__*/React.createElement(EventList, {
    items: d.events
  }), /*#__PURE__*/React.createElement(AdSlot, {
    format: "halfpage",
    position: "Sidebar \xB7 sticky",
    sticky: true
  }))));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/PostScreen.jsx
try { (() => {
const PDP = window.ParnaBaDigitalDesignSystem_fe2577;
function PostScreen({
  mobile,
  onOpenPost,
  onOpenBairro
}) {
  const {
    Breadcrumb,
    Badge,
    PhotoFrame,
    CurationStamp,
    RegionalContextBox,
    AttributionFooter,
    ShareBar,
    AdSlot,
    SectionHeading,
    NewsCard,
    PharmacyList,
    EventList,
    Tag,
    Icon
  } = PDP;
  const d = window.PD_DATA;
  const p = d.post;
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: mobile ? "var(--space-5) var(--space-4) 0" : "var(--space-7) var(--container-gutter) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: mobile ? "mobileBanner" : "leaderboard",
    position: "Topo do artigo"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "minmax(0, 1fr) var(--sidebar-width)",
      gap: "var(--space-10)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("article", {
    style: {
      maxWidth: "var(--content-measure)"
    }
  }, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: "Home",
      href: "#"
    }, {
      label: "Bairros",
      href: "#"
    }, {
      label: p.bairro
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      margin: "var(--space-5) 0 var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "soft"
  }, p.kicker), /*#__PURE__*/React.createElement(Tag, {
    size: "sm",
    onClick: onOpenBairro ? e => {
      e.preventDefault();
      onOpenBairro(p.bairro);
    } : undefined
  }, p.bairro)), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--type-headline-xl)",
      color: "var(--text-strong)",
      marginBottom: "var(--space-5)",
      textWrap: "balance"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--pd-blue-700)"
    }
  }, p.bairro, ", ", p.city, ":"), " ", p.headline.replace(p.bairro + " ", "")), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-lede)",
      color: "var(--text-muted)",
      marginBottom: "var(--space-5)"
    }
  }, p.lede), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "var(--space-4)",
      paddingBottom: "var(--space-5)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(CurationStamp, {
    minutes: p.minutes,
    reviewed: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-meta)",
      color: "var(--text-faint)"
    }
  }, "Publicado em ", p.publishedAt)), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "var(--space-6) 0"
    }
  }, /*#__PURE__*/React.createElement(PhotoFrame, {
    ratio: "16 / 9",
    credit: "Foto: Secretaria de Tr\xE2nsito de Parna\xEDba"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-body-sm)",
      color: "var(--text-faint)",
      marginTop: "var(--space-3)"
    }
  }, "Trecho da Avenida S\xE3o Sebasti\xE3o onde a faixa elevada ser\xE1 instalada, no bairro S\xE3o Jos\xE9.")), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body)"
    }
  }, p.paragraphs[0]), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body)"
    }
  }, p.paragraphs[1]), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "var(--space-8) 0"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: "inread",
    position: "In-article \xB7 ap\xF3s o 2\xBA par\xE1grafo"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body)"
    }
  }, p.paragraphs[2]), /*#__PURE__*/React.createElement(RegionalContextBox, {
    bairro: p.bairro,
    items: p.context,
    links: p.contextLinks,
    mapLabel: "Mapa do bairro " + p.bairro
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      font: "var(--type-body)"
    }
  }, p.paragraphs[3]), /*#__PURE__*/React.createElement(ShareBar, null), /*#__PURE__*/React.createElement(AttributionFooter, {
    source: p.source,
    sourceHref: "#",
    publishedAt: p.publishedAt
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    linkLabel: "Tudo sobre " + p.bairro
  }, "Leia tamb\xE9m no seu bairro"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      gap: "var(--grid-gap-tight)"
    }
  }, d.stories.slice(2, 4).map(s => /*#__PURE__*/React.createElement("div", {
    key: s.headline,
    onClick: onOpenPost ? e => {
      e.preventDefault();
      onOpenPost();
    } : undefined
  }, /*#__PURE__*/React.createElement(NewsCard, s)))))), /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: "rectangle",
    position: "Sidebar do artigo"
  }), /*#__PURE__*/React.createElement(PharmacyList, {
    date: "hoje, 4/8",
    items: d.pharmacies.slice(0, 2)
  }), /*#__PURE__*/React.createElement(EventList, {
    items: d.events.slice(0, 2)
  }), /*#__PURE__*/React.createElement(AdSlot, {
    format: "halfpage",
    position: "Sidebar \xB7 sticky",
    sticky: true
  }))));
}
Object.assign(window, {
  PostScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/PostScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/ServicesScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PDS = window.ParnaBaDigitalDesignSystem_fe2577;
function ServicesScreen({
  mobile,
  onOpenBairro
}) {
  const {
    PharmacyList,
    JobList,
    EventList,
    WidgetCard,
    AdSlot,
    SectionHeading,
    Breadcrumb,
    Icon,
    WeatherStrip,
    Badge,
    NeighborhoodTagBar,
    Button
  } = PDS;
  const d = window.PD_DATA;
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: mobile ? "var(--space-5) var(--space-4) 0" : "var(--space-7) var(--container-gutter) 0"
    }
  }, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: "Home",
      href: "#"
    }, {
      label: "Utilidade pública"
    }]
  }), /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "var(--space-5)",
      margin: "var(--space-5) 0 var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--pd-mar-700)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "life-buoy",
    size: 13
  }), " Automa\xE7\xE3o cont\xEDnua"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: "var(--type-headline-xl)",
      color: "var(--text-strong)",
      marginTop: "var(--space-3)"
    }
  }, "Utilidade p\xFAblica em Parna\xEDba")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: mobile ? 0 : "auto",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(WeatherStrip, _extends({
    onDark: false
  }, d.weather)), /*#__PURE__*/React.createElement(Badge, {
    tone: "utility",
    icon: "refresh-cw"
  }, "Atualizado hoje, 06h"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: mobile ? "mobileBanner" : "leaderboard",
    position: "Topo da utilidade p\xFAblica"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      gap: "var(--grid-gap)",
      alignItems: "start",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(PharmacyList, {
    date: "hoje, 4/8",
    items: d.pharmacies
  }), /*#__PURE__*/React.createElement(JobList, {
    count: 23,
    items: d.jobs
  }), /*#__PURE__*/React.createElement(EventList, {
    items: d.events
  }), /*#__PURE__*/React.createElement(WidgetCard, {
    title: "Telefones de emerg\xEAncia",
    icon: "phone",
    accent: "brand",
    footerLabel: "Lista completa",
    updatedLabel: "Revisado pela reda\xE7\xE3o em 1/8"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 1fr",
      gap: "var(--space-4)"
    }
  }, d.phones.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.label
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      font: "var(--type-kicker)",
      letterSpacing: "var(--tracking-caps)",
      textTransform: "uppercase",
      color: "var(--text-faint)"
    }
  }, p.label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-data)",
      color: "var(--text-strong)"
    }
  }, p.value)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr var(--sidebar-width)",
      gap: "var(--grid-gap)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeading, {
    accent: "blue",
    linkLabel: "Como funciona nossa curadoria"
  }, "Servi\xE7os por bairro"), /*#__PURE__*/React.createElement(NeighborhoodTagBar, {
    title: "Escolha o bairro para ver servi\xE7os locais",
    bairros: d.bairros,
    onSelect: onOpenBairro
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "var(--space-7) 0"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: "inread",
    position: "Meio da p\xE1gina de servi\xE7os"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      flexWrap: "wrap",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "hot",
    iconLeft: "message-circle"
  }, "Receber plant\xE3o no WhatsApp"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconRight: "arrow-right"
  }, "Enviar uma pauta de servi\xE7o"))), /*#__PURE__*/React.createElement("aside", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(AdSlot, {
    format: "rectangle",
    position: "Sidebar"
  }), /*#__PURE__*/React.createElement(AdSlot, {
    format: "halfpage",
    position: "Sidebar \xB7 sticky",
    sticky: true
  }))));
}
Object.assign(window, {
  ServicesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/ServicesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/data.js
try { (() => {
window.PD_DATA = {
  weather: {
    temp: 32,
    condition: "Sol com nuvens",
    icon: "sun",
    humidity: 64
  },
  date: "Terça, 4 de agosto de 2026",
  bairros: [{
    name: "São José",
    count: 12
  }, {
    name: "Centro",
    count: 9
  }, {
    name: "Nossa Senhora de Fátima",
    count: 7
  }, {
    name: "Piauí",
    count: 6
  }, {
    name: "Frei Higino",
    count: 4
  }, {
    name: "Reis Veloso",
    count: 3
  }, {
    name: "Pedra do Sal",
    count: 3
  }, {
    name: "Ilha Grande",
    count: 2
  }],
  hero: {
    bairro: "Pedra do Sal",
    kicker: "Destaque",
    headline: "Pedra do Sal terá reforço de salva-vidas no feriado do dia 15",
    summary: "Prefeitura confirma oito agentes por turno entre sábado e segunda, com posto móvel na entrada da praia.",
    minutes: 5
  },
  stories: [{
    bairro: "São José",
    kicker: "Trânsito",
    headline: "São José ganha nova faixa elevada de pedestres na Av. São Sebastião",
    summary: "Intervenção começa na segunda e muda o fluxo em dois cruzamentos do bairro.",
    minutes: 12
  }, {
    bairro: "Centro",
    kicker: "Urgente",
    kickerTone: "urgent",
    headline: "Centro tem bloqueio na Rua Grande até sexta por obra de drenagem",
    summary: "Trecho de 300 metros fica interditado das 7h às 18h; desvio pela Duque de Caxias.",
    minutes: 3
  }, {
    bairro: "Nossa Senhora de Fátima",
    kicker: "Saúde",
    headline: "Fátima recebe mutirão de exames na UBS no próximo sábado",
    summary: "Atendimento por ordem de chegada, das 8h às 14h, com 300 vagas.",
    minutes: 26
  }, {
    bairro: "Piauí",
    kicker: "Serviços",
    headline: "Bairro Piauí passa a ter coleta seletiva em dois turnos",
    summary: "Mudança vale a partir de segunda e atende 4 mil domicílios.",
    minutes: 41
  }, {
    bairro: "Frei Higino",
    kicker: "Educação",
    headline: "Frei Higino: escola municipal abre matrículas para o 2º semestre",
    summary: "São 180 vagas do 1º ao 5º ano, com inscrição presencial.",
    minutes: 58
  }, {
    bairro: "Reis Veloso",
    kicker: "Economia",
    headline: "Reis Veloso terá feira de empreendedores no fim de semana",
    summary: "Sessenta expositores confirmados na praça central do bairro.",
    minutes: 76
  }, {
    bairro: "Ilha Grande",
    kicker: "Litoral",
    headline: "Ilha Grande de Santa Isabel amplia horário da travessia de barcas",
    summary: "Nova grade prevê saídas de 30 em 30 minutos na alta estação.",
    minutes: 94
  }, {
    bairro: "Centro",
    kicker: "Cultura",
    headline: "Centro recebe projeção de cinema ao ar livre no Porto das Barcas",
    summary: "Sessões gratuitas de quinta a domingo, sempre às 19h30.",
    minutes: 118
  }],
  mostRead: [{
    bairro: "Centro",
    headline: "Centro tem bloqueio na Rua Grande até sexta",
    minutes: 3
  }, {
    bairro: "São José",
    headline: "São José ganha nova faixa elevada de pedestres",
    minutes: 12
  }, {
    bairro: "Piauí",
    headline: "Bairro Piauí passa a ter coleta seletiva em dois turnos",
    minutes: 41
  }, {
    bairro: "Nossa Senhora de Fátima",
    headline: "Fátima recebe mutirão de exames na UBS",
    minutes: 26
  }],
  pharmacies: [{
    name: "Farmácia Central",
    address: "Av. Getúlio Vargas, 820",
    bairro: "Centro",
    phone: "(86) 3322-4410",
    hours: "24h"
  }, {
    name: "Drogaria São José",
    address: "R. Duque de Caxias, 145",
    bairro: "São José",
    phone: "(86) 3321-9080",
    hours: "07h–23h"
  }, {
    name: "Farmácia Popular Delta",
    address: "Av. São Sebastião, 2340",
    bairro: "Reis Veloso",
    phone: "(86) 3323-1177",
    hours: "08h–22h"
  }],
  jobs: [{
    role: "Auxiliar de logística",
    bairro: "Nossa Senhora de Fátima",
    company: "Distribuidora Delta",
    salary: "R$ 1.6k",
    isNew: true
  }, {
    role: "Recepcionista bilíngue",
    bairro: "Centro",
    company: "Pousada Porto das Barcas",
    salary: "R$ 1.9k"
  }, {
    role: "Vendedor externo",
    bairro: "Piauí",
    company: "Casa do Construtor"
  }, {
    role: "Auxiliar de cozinha",
    bairro: "Reis Veloso",
    company: "Restaurante Maré Alta",
    salary: "R$ 1.5k"
  }],
  events: [{
    day: 8,
    weekday: "sáb",
    title: "Feira do Porto das Barcas",
    time: "17h",
    place: "Porto das Barcas"
  }, {
    day: 9,
    weekday: "dom",
    title: "Corrida do Delta – 5km",
    time: "06h30",
    place: "Av. Beira Rio"
  }, {
    day: 9,
    weekday: "dom",
    title: "Forró da Praça da Graça",
    time: "20h",
    place: "Praça da Graça"
  }],
  phones: [{
    label: "Samu",
    value: "192"
  }, {
    label: "Bombeiros",
    value: "193"
  }, {
    label: "Polícia Militar",
    value: "190"
  }, {
    label: "Defesa Civil",
    value: "(86) 3321-7788"
  }, {
    label: "Águas de Parnaíba",
    value: "0800 086 0195"
  }, {
    label: "Equatorial Piauí",
    value: "0800 086 0800"
  }],
  post: {
    bairro: "São José",
    city: "Parnaíba",
    kicker: "Trânsito",
    headline: "São José ganha nova faixa elevada de pedestres na Avenida São Sebastião",
    lede: "A intervenção começa na segunda-feira, altera o fluxo em dois cruzamentos e deve durar três semanas, segundo a Secretaria de Trânsito de Parnaíba.",
    minutes: 12,
    publishedAt: "4/8/2026 às 09:12",
    source: "Diário do Litoral",
    paragraphs: ["A faixa elevada será instalada entre a Rua Duque de Caxias e a Avenida São Sebastião, no trecho em frente à escola municipal do bairro São José. De acordo com a Secretaria Municipal de Trânsito, o objetivo é reduzir a velocidade média na via, que registra fluxo intenso em três horários de pico.", "Durante a obra, o cruzamento com a Rua Grande funcionará em meia pista, com agentes orientando o tráfego das 6h30 às 18h. Moradores da parte alta do bairro devem usar o desvio pela Avenida Chagas Rodrigues, que recebeu sinalização nova na semana passada.", "A pasta informou que o serviço integra o pacote de mobilidade que já contemplou o Centro e o bairro Nossa Senhora de Fátima. A previsão de conclusão é 25 de agosto, com liberação total da via no dia seguinte.", "Comerciantes da avenida foram notificados sobre a interdição parcial das vagas de estacionamento. Quem precisar de carga e descarga deve solicitar autorização temporária pelo portal da prefeitura ou pelo telefone da secretaria."],
    context: [{
      label: "Samu",
      value: "192"
    }, {
      label: "Bombeiros",
      value: "193"
    }, {
      label: "UBS São José",
      value: "(86) 3322-1010"
    }, {
      label: "Sec. de Trânsito",
      value: "(86) 3321-4055"
    }],
    contextLinks: [{
      label: "Agendar consulta na UBS São José"
    }, {
      label: "Solicitar autorização de carga e descarga"
    }]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/data.js", error: String((e && e.message) || e) }); }

__ds_ns.AdSlot = __ds_scope.AdSlot;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.PhotoFrame = __ds_scope.PhotoFrame;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.WeatherStrip = __ds_scope.WeatherStrip;

__ds_ns.AttributionFooter = __ds_scope.AttributionFooter;

__ds_ns.CurationStamp = __ds_scope.CurationStamp;

__ds_ns.HeroStory = __ds_scope.HeroStory;

__ds_ns.NeighborhoodTagBar = __ds_scope.NeighborhoodTagBar;

__ds_ns.NewsCard = __ds_scope.NewsCard;

__ds_ns.NewsListItem = __ds_scope.NewsListItem;

__ds_ns.RegionalContextBox = __ds_scope.RegionalContextBox;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.ShareBar = __ds_scope.ShareBar;

__ds_ns.DestinationCard = __ds_scope.DestinationCard;

__ds_ns.LodgingCard = __ds_scope.LodgingCard;

__ds_ns.LodgingList = __ds_scope.LodgingList;

__ds_ns.EventList = __ds_scope.EventList;

__ds_ns.JobList = __ds_scope.JobList;

__ds_ns.PharmacyList = __ds_scope.PharmacyList;

__ds_ns.WidgetCard = __ds_scope.WidgetCard;

})();
