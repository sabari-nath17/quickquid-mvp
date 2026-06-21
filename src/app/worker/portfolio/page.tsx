import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FolderGit2, ExternalLink } from "lucide-react";
import { ProjectForm } from "./project-form";
import { DeleteProject } from "./delete-project";

export default async function WorkerPortfolioPage() {
  const session = await requireAuth().catch(() => redirect("/sign-in"));
  if (session.role !== "WORKER") redirect("/");

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.id },
    include: { portfolioProjects: { orderBy: { createdAt: "desc" } } },
  });
  if (!worker) redirect("/worker/onboarding");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderGit2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Portfolio</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground font-heading">Showcase your work</h1>
          <p className="text-muted-foreground mt-1">
            Build reusable project showcases — then attach them to job proposals to impress clients.
          </p>
        </div>
        <ProjectForm />
      </div>

      {worker.portfolioProjects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-xl">
          <FolderGit2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No projects yet</p>
          <p className="text-sm mt-1">Add your best work to stand out in applications.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {worker.portfolioProjects.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-border overflow-hidden flex flex-col">
              {p.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.title} className="w-full aspect-[16/9] object-cover" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground font-heading">{p.title}</h3>
                  <DeleteProject projectId={p.id} />
                </div>
                {p.role && <p className="text-xs text-primary font-medium mt-0.5">{p.role}</p>}
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">{p.description}</p>
                {p.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-medium">{s}</span>
                    ))}
                  </div>
                )}
                {p.projectUrl && (
                  <a href={p.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                    <ExternalLink className="w-3 h-3" />
                    View project
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
