"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { submitWorkerProfile } from "@/app/actions/worker";
import { Globe, FileText, User, AlertCircle, ImageIcon, Briefcase, MapPin } from "lucide-react";

const selectClass =
  "w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

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
    avatarUrl?: string | null;
    title?: string | null;
    hourlyRate?: number | null;
    location?: string | null;
    timezone?: string | null;
    availabilityStatus?: string | null;
    weeklyAvailability?: string | null;
    openToContractHire?: boolean | null;
    responseTime?: string | null;
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

      {/* Profile Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-heading">
            <ImageIcon className="w-4 h-4 text-primary" />
            Profile Photo &amp; Headline
          </CardTitle>
          <CardDescription>Your public-facing identity on QuickQuid</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Profile Photo URL (optional)</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              placeholder="https://example.com/your-photo.jpg"
              defaultValue={existing?.avatarUrl ?? ""}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Paste a direct image URL. File upload coming soon.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Professional Headline (optional)</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Senior Full-Stack Developer • 5 yrs exp"
              defaultValue={existing?.title ?? ""}
              maxLength={120}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate in ₹ (optional)</Label>
            <Input
              id="hourlyRate"
              name="hourlyRate"
              type="number"
              min={0}
              placeholder="e.g. 2500"
              defaultValue={existing?.hourlyRate ?? ""}
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability & Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 font-heading">
            <MapPin className="w-4 h-4 text-primary" />
            Availability &amp; Location
          </CardTitle>
          <CardDescription>Helps clients know where you are and how you work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Kochi, India"
                defaultValue={existing?.location ?? ""}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Time zone</Label>
              <select id="timezone" name="timezone" defaultValue={existing?.timezone ?? "Asia/Kolkata"} className={selectClass}>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Asia/Dubai">Gulf (GST)</option>
                <option value="Europe/London">UK (GMT/BST)</option>
                <option value="America/New_York">US Eastern</option>
                <option value="America/Los_Angeles">US Pacific</option>
                <option value="Asia/Singapore">Singapore</option>
                <option value="Australia/Sydney">Australia (Sydney)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availabilityStatus">Availability</Label>
              <select id="availabilityStatus" name="availabilityStatus" defaultValue={existing?.availabilityStatus ?? "OPEN_TO_OFFERS"} className={selectClass}>
                <option value="AVAILABLE_NOW">Available now</option>
                <option value="OPEN_TO_OFFERS">Open to offers</option>
                <option value="NOT_AVAILABLE">Not available</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyAvailability">Hours per week</Label>
              <select id="weeklyAvailability" name="weeklyAvailability" defaultValue={existing?.weeklyAvailability ?? "AS_NEEDED"} className={selectClass}>
                <option value="AS_NEEDED">As needed — open to offers</option>
                <option value="LESS_THAN_30">Less than 30 hrs/week</option>
                <option value="THIRTY_PLUS">More than 30 hrs/week</option>
                <option value="FULL_TIME">Full time (40 hrs/week)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responseTime">Typical response time</Label>
              <select id="responseTime" name="responseTime" defaultValue={existing?.responseTime ?? "1-4 hours"} className={selectClass}>
                <option value="Within 1 hour">Within 1 hour</option>
                <option value="1-4 hours">1–4 hours</option>
                <option value="4-8 hours">4–8 hours</option>
                <option value="Within a day">Within a day</option>
                <option value="A few days">A few days</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  name="openToContractHire"
                  defaultChecked={existing?.openToContractHire ?? false}
                  className="w-4 h-4"
                />
                Open to contract-to-hire
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

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
