import type { RolesContent } from "@/types/service";
import SectionHeader, { SECTION_INNER } from "./SectionHeader";
import RolesPicker from "./RolesPicker";

interface RolesProps {
  id: string;
  content: RolesContent;
}

export default function Roles({ id, content }: RolesProps) {
  const { copy, ...picker } = content;
  return (
    <section id={id} className="scroll-mt-[65px] bg-white" aria-labelledby={`${id}-title`}>
      <div className={SECTION_INNER}>
        <SectionHeader id={`${id}-title`} copy={copy} />
        <RolesPicker content={picker} />
      </div>
    </section>
  );
}
