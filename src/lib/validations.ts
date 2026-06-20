import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["WORKER", "CLIENT"]),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const workerProfileSchema = z.object({
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL"),
  portfolioUrls: z
    .array(z.string().url("Please enter valid URLs"))
    .min(1, "At least one portfolio URL is required")
    .max(5, "Maximum 5 portfolio URLs"),
  skills: z
    .array(z.string().min(1))
    .min(1, "At least one skill is required")
    .max(20, "Maximum 20 skills"),
  bio: z
    .string()
    .max(500, "Bio must be under 500 characters")
    .optional(),
  experienceText: z
    .string()
    .min(50, "Please provide at least 50 characters of experience detail")
    .max(5000, "Experience text must be under 5000 characters"),
});

export const jobRequirementSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be under 5000 characters"),
  skills: z
    .array(z.string().min(1))
    .min(1, "At least one required skill")
    .max(15, "Maximum 15 skills"),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
});

export const workerApprovalSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  verificationNotes: z.string().max(1000).optional(),
});

export const introduceConfirmSchema = z.object({
  confirmed: z.literal(true, { error: "You must confirm this action" }),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;
export type JobRequirementInput = z.infer<typeof jobRequirementSchema>;
export type WorkerApprovalInput = z.infer<typeof workerApprovalSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
