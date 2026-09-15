import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type OrgContext = {
  organizationId: string;
  name: string;
  plan: string;
  role: "owner" | "admin" | "agent";
  subscriptionStatus: string;
  trialEndsAt: string;
};

export function useOrg() {
  return useQuery<OrgContext | null>({
    queryKey: ["current-org"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      const { data, error } = await supabase
        .from("organization_members")
        .select("role, organization_id, organizations(name, plan, subscription_status, trial_ends_at)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data || !data.organizations) return null;

      const org = data.organizations as unknown as {
        name: string;
        plan: string;
        subscription_status: string;
        trial_ends_at: string;
      };

      return {
        organizationId: data.organization_id,
        name: org.name,
        plan: org.plan,
        role: data.role,
        subscriptionStatus: org.subscription_status,
        trialEndsAt: org.trial_ends_at,
      };
    },
    staleTime: 60_000,
  });
}
