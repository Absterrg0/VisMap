import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/db";
import { customSession, genericOAuth, oAuthProxy } from "better-auth/plugins";

 
export const auth = betterAuth({
appName: "Project-vis",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins:[
    oAuthProxy(), 
  ]
});