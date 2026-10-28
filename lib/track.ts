import type {
  Cca,
  ElectiveId,
  Flags,
  ProjectTrack,
  Stats,
} from "@/lib/types";

export function projectTrack(electives: ElectiveId[], cca: Cca): ProjectTrack {
  const has = (id: ElectiveId) => electives.includes(id);
  const scienceCount = (["phy", "chem", "bio"] as ElectiveId[]).filter(has).length;
  if (scienceCount >= 1) return "science";
  if (has("va")) return "creative";
  if (has("econ") || has("bafs")) return "business";
  if (has("ict")) return "tech";
  if (has("hist") || has("chist") || has("geog")) return "humanities";
  if (cca === "science") return "science";
  return "general";
}

export function fairAligns(track: string, boost: string): boolean {
  if (
    track === "science" &&
    (boost === "science" ||
      boost === "medicine" ||
      boost === "engineering" ||
      boost === "teaching")
  ) {
    return true;
  }
  if (track === "tech" && (boost === "engineering" || boost === "media")) return true;
  if (track === "business" && (boost === "business" || boost === "accounting")) return true;
  if (
    track === "humanities" &&
    (boost === "humanities" || boost === "policy" || boost === "teaching")
  ) {
    return true;
  }
  if (track === "creative" && (boost === "design" || boost === "media")) return true;
  if (track === "general" && boost === "teaching") return true;
  return false;
}

export function decideFair(stats: Stats): Flags["fair"] {
  const sum = stats.academic + stats.curiosity;
  if (sum >= 150 && stats.wellbeing >= 42) return "prize";
  if (sum >= 120 && stats.wellbeing >= 34) return "shown";
  return "rushed";
}
