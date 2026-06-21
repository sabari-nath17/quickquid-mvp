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

// Platform wage floor — substandard (low-ball) postings are blocked before reaching worker feeds.
export const WAGE_FLOOR = 500;

export const jobRequirementSchema = z
  .object({
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
    collarType: z.enum(["WHITE", "GREY", "BLUE"]).default("WHITE"),
    budgetMin: z.coerce
      .number()
      .int()
      .min(WAGE_FLOOR, `Budget must be at least ₹${WAGE_FLOOR} — sub-floor postings are not allowed`)
      .max(100000000),
    budgetMax: z.coerce.number().int().min(WAGE_FLOOR).max(100000000),
    timeline: z.string().max(100).optional(),
  })
  .refine((d) => d.budgetMax >= d.budgetMin, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["budgetMax"],
  });

export const workerApprovalSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  verificationNotes: z.string().max(1000).optional(),
});

export const introduceConfirmSchema = z.object({
  confirmed: z.literal(true, { error: "You must confirm this action" }),
});

const subRating = z.number().int().min(1).max(5).optional();

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  qualityRating: subRating,
  communicationRating: subRating,
  professionalismRating: subRating,
  reliabilityRating: subRating,
  flexibilityRating: subRating,
  comment: z.string().max(1000).optional(),
});

export const jobApplicationSchema = z.object({
  coverLetter: z.string().max(2000).optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
});

export const workSubmissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(3000).optional(),
  fileUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  isPreview: z.boolean().default(false),
});

export const workerProfileExtendedSchema = z.object({
  avatarUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  title: z.string().max(120, "Title must be under 120 characters").optional(),
  hourlyRate: z.coerce.number().int().min(0).max(1000000).optional(),
});

const serviceTierSchema = z.object({
  name: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
  price: z.coerce.number().int().min(100, "Minimum tier price is ₹100").max(10000000),
  deliveryDays: z.coerce.number().int().min(1, "Delivery must be at least 1 day").max(365),
  revisions: z.coerce.number().int().min(0).max(99).default(1),
  description: z.string().max(500).optional(),
  features: z.array(z.string().min(1)).max(15).default([]),
});

export const servicePackageSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(120),
  description: z.string().min(30, "Description must be at least 30 characters").max(3000),
  category: z.string().min(2, "Category is required").max(60),
  skills: z.array(z.string().min(1)).min(1, "At least one skill").max(15),
  coverImageUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  tiers: z.array(serviceTierSchema).min(1, "At least one pricing tier is required").max(3),
});

export const serviceOrderSchema = z.object({
  tierId: z.string().min(1, "Select a tier"),
  fastTrack: z.boolean().default(false),
  requirements: z.string().max(2000).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type WorkerProfileInput = z.infer<typeof workerProfileSchema>;
export type JobRequirementInput = z.infer<typeof jobRequirementSchema>;
export type WorkerApprovalInput = z.infer<typeof workerApprovalSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type WorkSubmissionInput = z.infer<typeof workSubmissionSchema>;
