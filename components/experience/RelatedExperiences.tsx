import { prisma } from "@/lib/db";
import { InterviewDetail } from "@/lib/queries/interview-detail";
import { Box, Calendar, Compass, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function RelatedExperiences({
  interview,
}: {
  interview: InterviewDetail;
}) {
  // Query other interviews in the database in parallel
  const [sameCompany, sameRole] = await Promise.all([
    prisma.interview.findMany({
      where: {
        companyId: interview.companyId,
        id: { not: interview.id },
      },
      take: 4,
      include: { company: true, roleLevel: true },
    }),
    prisma.interview.findMany({
      where: {
        roleLevelId: interview.roleLevelId,
        id: { not: interview.id },
      },
      take: 4,
      include: { company: true, roleLevel: true },
    }),
  ]);

  const allRelated = [...sameCompany, ...sameRole].filter(
    (item, index, self) => self.findIndex((t) => t.id === item.id) === index
  );

  return (
    <div className="space-y-4 no-print">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <Compass className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Explore Related Experiences</h3>
      </div>

      {allRelated.length === 0 ? (
        <div className="bg-card border border-border rounded-md p-6 text-center text-sm text-muted-foreground font-semibold flex flex-col items-center gap-2">
          <Box className="w-8 h-8 text-muted-foreground/30" />
          <span>More experiences coming soon.</span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {allRelated.map((item) => {
            const initial = item.company.name.charAt(0).toUpperCase();
            return (
              <Link
                key={item.id}
                href={`/experiences/${item.id}`}
                className="bg-card border border-border hover:border-primary p-4 rounded-md flex flex-col justify-between hover:shadow-sm transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    {item.company.logoUrl ? (
                      <div className="relative w-6 h-6 rounded bg-white flex items-center justify-center border border-border p-0.5">
                        <Image
                          src={item.company.logoUrl}
                          alt=""
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded bg-secondary text-primary flex items-center justify-center text-[10px] font-bold border border-border">
                        {initial}
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-foreground">
                      {item.company.name}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {item.role}
                    </h4>
                    <p className="text-[9px] text-muted-foreground font-extrabold mt-0.5 uppercase tracking-wider">
                      {item.roleLevel.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2.5 mt-3.5 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                    Year: {item.year}
                  </span>
                  {item.totalSelected != null && item.totalSelected > 0 ? (
                    <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-extrabold">
                      <Users className="w-3 h-3" />
                      {item.totalSelected} Selected
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
