import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import en from "./dictionaries/en";
import ms from "./dictionaries/ms";

const dictionaries: Record<Locale, Dictionary> = { en, ms };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

/**
 * Interpolates `{token}` placeholders in a translated string, e.g.
 * format("Hi {name}", { name: "Amelia" }) -> "Hi Amelia"
 */
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
