"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { GateNameNode } from "@/config/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  firstName: z
    .string()
    .min(1, "Enter your name")
    .max(80, "Too long"),
});

type Form = z.infer<typeof schema>;

type Props = {
  node: GateNameNode;
  defaultName: string;
  onSubmit: (name: string) => void;
};

export function GateName({ node, defaultName, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: defaultName || "" },
  });

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{node.title}</CardTitle>
        <CardDescription>{node.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((data) => onSubmit(data.firstName.trim()))}
          className="flex flex-col gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="quiz-first-name">Name</Label>
            <Input
              id="quiz-first-name"
              type="text"
              autoComplete="given-name"
              placeholder={node.placeholder}
              {...register("firstName")}
            />
            {errors.firstName ? (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
