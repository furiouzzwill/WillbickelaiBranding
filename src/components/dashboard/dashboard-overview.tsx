import { FolderKanban, Palette, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export type DashboardOverviewProps = {
  displayName: string;
};

/**
 * Presentational dashboard body.
 *
 * Kept free of data fetching so the route owns auth and loading while this
 * owns layout. Brands, projects, and assets arrive in Phases 3, 7, and 8 —
 * until those tables exist this renders honest empty states rather than
 * placeholder data that would look like working features.
 */
export function DashboardOverview({ displayName }: DashboardOverviewProps) {
  return (
    <>
      <PageHeader
        title={`Welcome, ${displayName}`}
        description="Build your brand once, then create everything from it."
        action={
          <Button disabled title="Available once the Brand Builder ships">
            <Sparkles aria-hidden />
            Create brand
          </Button>
        }
      />

      <section aria-labelledby="brands-heading" className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <h2 id="brands-heading" className="text-sm font-semibold text-foreground">
            Your brands
          </h2>
          <Badge variant="brand">Phase 3</Badge>
        </div>

        <EmptyState
          icon={Palette}
          title="No brands yet"
          description="A brand holds your colours, typography, logo, visual style, and motion style. Everything you generate inherits from it."
          action={
            <Button variant="secondary" disabled>
              Create your first brand
            </Button>
          }
        />
      </section>

      <section aria-labelledby="projects-heading" className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <h2 id="projects-heading" className="text-sm font-semibold text-foreground">
            Recent projects
          </h2>
          <Badge variant="brand">Phase 7</Badge>
        </div>

        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Projects appear here once you start creating assets from a brand."
        />
      </section>

      <section aria-labelledby="next-heading">
        <h2 id="next-heading" className="mb-4 text-sm font-semibold text-foreground">
          What&apos;s coming
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RoadmapCard
            phase="Phase 3"
            title="Brand Builder"
            description="A guided flow that turns your identity into structured Brand DNA."
          />
          <RoadmapCard
            phase="Phase 5"
            title="Logo Generation"
            description="Generate on-brand logo concepts, or upload the logo you already have."
          />
          <RoadmapCard
            phase="Phase 6"
            title="Animated Logo Reveal"
            description="Your first branded animation, rendered from your saved brand."
          />
        </div>
      </section>
    </>
  );
}

function RoadmapCard({
  phase,
  title,
  description,
}: {
  phase: string;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="default" className="w-fit">
          {phase}
        </Badge>
        <CardTitle className="mt-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
