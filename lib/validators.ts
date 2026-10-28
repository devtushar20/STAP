import { z } from "zod";

export const DemoFormSchema = z
  .object({
    mode: z.enum(["demo", "sales"]).default("demo"),
    name: z.string().min(1, "Please enter your full name."),
    email: z
      .string()
      .min(1, "Please enter your work email.")
      .email("Please enter a valid work email address."),
    company: z.string().min(1, "Please enter your company name."),
    team_size: z.string().min(1, "Please select your team size."),
    message: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "sales" && (!data.message || data.message.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message: "Please tell us how we can help.",
      });
    }
  });

export type DemoFormData = z.infer<typeof DemoFormSchema>;

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

