import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Globe, ExternalLink } from "lucide-react";

interface WorkerCardProps {
  name: string;
  bio?: string | null;
  skills: string[];
  isVerified: boolean;
  linkedinUrl?: string;
  portfolioUrls?: string[];
  showContact?: boolean;
}

export function WorkerCard({
  name,
  bio,
  skills,
  isVerified,
  linkedinUrl,
  portfolioUrls,
  showContact = false,
}: WorkerCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="card-hover border border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground font-heading truncate">
                {name}
              </h3>
              {isVerified && (
                <span className="verified-badge shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            {bio && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {bio}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs font-normal"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 6 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{skills.length - 6} more
              </Badge>
            )}
          </div>
        )}

        {showContact && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                LinkedIn Profile
              </a>
            )}
            {portfolioUrls?.slice(0, 2).map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Portfolio {portfolioUrls!.length > 1 ? i + 1 : ""}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
