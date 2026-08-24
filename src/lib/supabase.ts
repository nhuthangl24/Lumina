import { createClient } from "@supabase/supabase-js";

// Use environment variables or fallback values to prevent crashes during build/dev
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to broadcast an event from the server API routes.
 * 
 * @param channelName Name of the channel (e.g., 'presence-room-123')
 * @param eventName Name of the event (e.g., 'timer-update')
 * @param payload The data to send
 */
export const broadcastEvent = async (channelName: string, eventName: string, payload: any) => {
  if (supabaseUrl === "https://mock.supabase.co") {
    console.warn(`[Supabase Mock] Triggered ${eventName} on ${channelName}`);
    return;
  }

  return new Promise((resolve) => {
    const channel = supabase.channel(channelName);
    
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        try {
          await channel.send({
            type: 'broadcast',
            event: eventName,
            payload: payload,
          });
          resolve(true);
        } catch (err) {
          console.error("[Supabase Broadcast Error]", err);
          resolve(false);
        } finally {
          supabase.removeChannel(channel);
        }
      } else if (status === 'CHANNEL_ERROR') {
        supabase.removeChannel(channel);
        resolve(false);
      }
    });

    // Timeout fallback just in case connection takes too long
    setTimeout(() => {
      resolve(false);
    }, 3000);
  });
};
