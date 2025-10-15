import NextAuth from "next-auth"
import "next-auth/jwt"

import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Notion from "next-auth/providers/notion"
import { db } from "./db"
import { credits, workspaces, memberInWorkspace, workspaceInvitations } from "./db/schema"
import { eq } from "drizzle-orm"

// Utility functions
const createId = () => crypto.randomUUID();

const getNewUserInvitations = async (email: string) => {
  // Get workspace invitations for this email
  const invitations = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.email, email));
  
  return {
    invitations: [], // For user invitations (if you have a separate user invitations table)
    workspaceInvitations: invitations
  };
};

const parseWorkspaceDefaultPlan = (email: string): 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' => {
  // Check if admin email
  const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];
  if (adminEmails.includes(email)) {
    return 'PRO';
  }
  return 'FREE';
};

const convertInvitationsToCollaborations = async (user: any, invitations: any[]) => {
  // Implementation for converting invitations to collaborations
  // This would typically involve creating collaboration records
  console.log('Converting invitations to collaborations', { user, invitations });
};

const joinWorkspaces = async (user: any, userWorkspaceInvitations: any[]) => {
  // Add user to workspaces based on invitations
  for (const invitation of userWorkspaceInvitations) {
    await db.insert(memberInWorkspace).values({
      userId: user.id,
      workspaceId: invitation.workspaceId,
      role: invitation.role
    }).onConflictDoNothing();
    
    // Remove the invitation after joining
    await db.delete(workspaceInvitations).where(eq(workspaceInvitations.id, invitation.id));
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Notion({
      clientId: process.env.AUTH_NOTION_ID,
      clientSecret: process.env.AUTH_NOTION_SECRET,
      redirectUri: process.env.AUTH_NOTION_REDIRECT_URI as string,
      allowDangerousEmailAccountLinking: true,
      token: {
        url: "https://api.notion.com/v1/oauth/token",
        async conform(response: Response) {
          const body = await response.json();
          body.refresh_token = '1234567890';
          return new Response(JSON.stringify(body), response);
        },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  basePath: "/api/auth",
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      if (pathname === "/middleware-example") return !!auth
      return true
    },
    jwt({ token, trigger, session, account }) {
      if (trigger === "update") token.name = session.user.name
      if (account?.provider === "keycloak") {
        return { ...token, accessToken: account.access_token }
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        // @ts-expect-error
        id: token.sub,
        // @ts-expect-error
        username: token?.user?.username || token?.user?.gh_username,
      };
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email) throw Error("Provider did not forward email but it is required");
      
      const userData = { 
        id: user.id || createId(), 
        email: user.email as string,
        name: user.name
      };
      
      const { invitations, workspaceInvitations } = await getNewUserInvitations(userData.email);
      
      // Check if signup is disabled and user is not admin or invited
      if (
        process.env.DISABLE_SIGNUP &&
        process.env.ADMIN_EMAIL?.split(",")?.every((email) => email !== userData.email) &&
        invitations.length === 0 &&
        workspaceInvitations.length === 0
      ) {
        throw Error("New users are forbidden");
      }

      const workspaceId = createId();
      let oneApiToken = "";
      let tokenId = null;

      // Create workspace only if user doesn't have workspace invitations
      if (workspaceInvitations.length === 0) {
        const newWorkspaceData = {
          id: workspaceId,
          name: userData.name ? `${userData.name}'s workspace` : "My workspace",
          plan: parseWorkspaceDefaultPlan(userData.email),
          oneApiToken,
          tokenId,
        };

        // Create workspace
        await db.insert(workspaces).values(newWorkspaceData);
        // Add user as admin to the workspace
        await db.insert(memberInWorkspace).values({
          userId: userData.id,
          workspaceId: workspaceId,
          role: 'ADMIN'
        });

        // Initialize credits for the workspace
        await db.insert(credits).values({
          workspaceId: workspaceId,
          totalCredits: 5, // Default credits for new workspaces
          usedCredits: 0,
        });
      }


      // Handle invitations
      if (invitations.length > 0) {
        await convertInvitationsToCollaborations(userData, invitations);
      }
      

      if (workspaceInvitations.length > 0) {
        await joinWorkspaces(userData, workspaceInvitations);
      }
    }
  },
  experimental: { enableWebAuthn: true },
})

declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}
