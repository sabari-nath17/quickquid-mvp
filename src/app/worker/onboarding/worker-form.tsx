"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { submitWorkerProfile } from "@/app/actions/worker";
import { Globe, FileText, User, AlertCircle } from "lucide-react";

type ActionState = { error?: string } | null;

function WorkerProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return submitWorkerProfile(formData) as Promise<ActionState>;
}

interface WorkerFormProps {
  existing?: {
    linkedinUrl: string;
    portfolioUrls: string[];
    skills: string[];
    bio: string | null;
    experienceText: string | null;
  } | null;
}

export function WorkerForm({ existing }: WorkerFormProps) {
  const [state, formAction, isPending] = useActionState(WorkerProfileAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      {/* LinkedIn */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-heading">
            <Globe className="w-4 h-4 text-[#0A66C2]" />
            LinkedIn Profile
          </CardTitle>
          <CardDescription>Your professional LinkedIn URL is required</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL *</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
              defaultValue={existing?.linkedinUrl ?? ""}
              required
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-heading">
            <FileText className="w-4 h-4 text-primary" />
            Portfolio Links
          </CardTitle>
          <CardDescription>Add one URL per line (max 5)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="portfolioUrls">Portfolio URLs * (one per line)</Label>
            <Textarea
              id="portfolioUrls"
              name="portfolioUrls"
              placeholder={`https://github.com/yourname\nhttps://yourportfolio.com`}
              defaultValue={existing?.portfolioUrls?.join("\n") ?? ""}
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-heading">
            <User className="w-4 h-4 text-primary" />
            About You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Short bio (optional, max 500 chars)</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="A brief professional summary that clients will see..."
              defaultValue={existing?.bio ?? ""}
              rows={2}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills * (comma-separated)</Label>
            <Input
              id="skills"
              name="skills"
              type="text"
              placeholder="React, Node.js, UI/UX Design, Python, Marketing..."
              defaultValue={existing?.skills?.join(", ") ?? ""}
              required
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Enter skills separated by commas (e.g., &quot;React, TypeScript, Node.js&quot;)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceText">Experience &amp; Background *</Label>
            <Textarea
              id="experienceText"
              name="experienceText"
              placeholder="Describe your education, projects, internships, and relevant experience. Be specific and professional. Minimum 50 characters..."
              defaultValue={existing?.experienceText ?? ""}
              rows={6}
              required
              minLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Markdown is supported. Min 50 characters.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
        {isPending
          ? "Submitting..."
          : existing
          ? "Update Profile"
          : "Submit for Review"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Your profile will be reviewed within 48 hours. You&apos;ll be notified once verified.
      </p>
    </form>
  );
}
