export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  shades: {
    DEFAULT: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "rose",
    name: "Rose / Coral",
    description: "Vibrant, premium, and modern warm pink-coral. (Default)",
    shades: {
      DEFAULT: "#F43F5E",
      50: "#FFF1F2",
      100: "#FFE4E6",
      200: "#FECDD3",
      300: "#FDA4AF",
      400: "#FB7185",
      500: "#F43F5E",
      600: "#E11D48",
      700: "#BE123C",
      800: "#9F1239",
      900: "#881337",
    },
  },
  {
    id: "emerald",
    name: "Emerald Green",
    description: "Fresh and clean color associated with wealth, growth, and cash flow.",
    shades: {
      DEFAULT: "#10B981",
      50: "#ECFDF5",
      100: "#D1FAE5",
      200: "#A7F3D0",
      300: "#6EE7B7",
      400: "#34D399",
      500: "#10B981",
      600: "#059669",
      700: "#047857",
      800: "#065F46",
      900: "#064E3B",
    },
  },
  {
    id: "violet",
    name: "Royal Violet",
    description: "High-end, sophisticated tech aesthetic using deep purples.",
    shades: {
      DEFAULT: "#6C5CE7",
      50: "#F3F1FE",
      100: "#E6E1FD",
      200: "#C7BCFA",
      300: "#A796F6",
      400: "#8A79EF",
      500: "#6C5CE7",
      600: "#5646C9",
      700: "#4234A0",
      800: "#302677",
      900: "#1D1750",
    },
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Trustworthy, corporate, clean, and balanced blue shades.",
    shades: {
      DEFAULT: "#0EA5E9",
      50: "#F0F9FF",
      100: "#E0F2FE",
      200: "#BAE6FD",
      300: "#7DD3FC",
      400: "#38BDF8",
      500: "#0EA5E9",
      600: "#0284C7",
      700: "#0369A1",
      800: "#075985",
      900: "#0C4A6E",
    },
  },
  {
    id: "amber",
    name: "Sunset Amber",
    description: "Warm, energetic, and golden accents for creativity.",
    shades: {
      DEFAULT: "#F59E0B",
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#F59E0B",
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F",
    },
  },
];

function hexToRgb(hex: string): string {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r} ${g} ${b}`;
}

export function applyColorPalette(paletteId: string) {
  if (typeof window === "undefined") return;
  const palette = COLOR_PALETTES.find((p) => p.id === paletteId) || COLOR_PALETTES[0];
  
  const root = document.documentElement;
  Object.entries(palette.shades).forEach(([shade, hex]) => {
    root.style.setProperty(`--primary-${shade}`, hexToRgb(hex));
  });
  
  localStorage.setItem("app-color-palette", paletteId);
}

export function getAppliedColorPalette(): string {
  if (typeof window === "undefined") return "rose";
  return localStorage.getItem("app-color-palette") || "rose";
}
