import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { recommendInputSchema } from "@/lib/recommend";
import { recommendFlavor } from "@/lib/recommend.server";

export const getFlavorRecommendation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => recommendInputSchema.parse(input))
  .handler(async ({ data }) => {
    let request: Request | undefined;
    try {
      request = getRequest();
    } catch {
      request = undefined;
    }
    return recommendFlavor(request, data);
  });
