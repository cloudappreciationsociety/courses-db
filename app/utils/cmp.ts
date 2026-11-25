import type { SectionWithDetails } from "@/lib/queries";
import { SectionComponent } from "@/types";

const componentSortOrder = ["lecture", "laboratory", "recitation"] as const;

export function section(a: SectionWithDetails, b: SectionWithDetails) {
    const componentRankA = componentSortOrder.indexOf(a.component as SectionComponent);
    const componentRankB = componentSortOrder.indexOf(b.component as SectionComponent);

    return (componentRankA - componentRankB) || a.sectionCode.localeCompare(b.sectionCode);
}