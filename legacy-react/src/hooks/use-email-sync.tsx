import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

/**
 * Hook to sync email subscriptions when a user registers
 * This will automatically link existing email subscriptions to the user account
 */
export function useEmailSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      syncUserEmailSubscriptions(user.email, user.id);
    }
  }, [user]);

  const syncUserEmailSubscriptions = async (email: string, userId: string) => {
    try {
      // Update existing email subscriptions with the new user_id
      const { error } = await supabase
        .from("email_subscriptions")
        .update({
          user_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email.toLowerCase())
        .is("user_id", null);

      if (error) {
        console.error("Error syncing email subscriptions:", error);
      } else {
        console.log("Email subscriptions synced successfully");
      }
    } catch (err) {
      console.error("Failed to sync email subscriptions:", err);
    }
  };

  return {
    syncUserEmailSubscriptions,
  };
}
