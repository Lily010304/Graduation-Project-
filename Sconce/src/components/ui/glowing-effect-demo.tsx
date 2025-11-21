"use client";

import { ClipboardCheck, Shield, CreditCard, Layers, Brain } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      {/* Placement Exam */}
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<ClipboardCheck className="h-4 w-4" />}
        title="Placement Exam"
        description="Adaptive assessment that pinpoints your level (A, B, or C) and sets a tailored starting path for faster progress."
      />
      {/* Parental Oversight */}
      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Shield className="h-4 w-4" />}
        title="Parental Oversight"
        description="Transparent view of attendance, assignments, and milestones—with weekly summaries and real‑time updates."
      />
      {/* Integrated Payments */}
      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<CreditCard className="h-4 w-4" />}
        title="Integrated Payments"
        description="Secure multi‑currency checkout, invoices, and effortless subscription management—all in one place."
      />
      {/* Program Structure */}
      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Layers className="h-4 w-4" />}
        title="Program Structure"
        description="Level‑based curriculum (A, B, C) with clear outcomes—blending vocab, grammar, speaking practice, and culture."
      />
      {/* Integrated AI */}
      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Brain className="h-4 w-4" />}
        title="Integrated AI"
        description="Automatically generates personalized notes and exercises for each lesson to reinforce learning and retention."
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-transparent p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          variant="white"
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/30 bg-[#58ACA9] p-6 shadow-sm md:p-6 text-white">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-white/30 bg-white/20 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-white">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-white/90">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
