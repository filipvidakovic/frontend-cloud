import type { Subscription } from "../pages/SubscriptionPage";

const API_URL = import.meta.env.VITE_API_URL;

function getJwt() {
    const idToken = localStorage.getItem("token");
    return idToken;
}

class SubscribeService {

  async subscribe(data: {
        type: string,
        id: string,
      }): Promise<void> {
      const result = getJwt();
      if (!result) {
          throw new Error("User is not authenticated");
      }
      const token  = result;
    try {
      console.log(data)
      const response = await fetch(`${API_URL}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }
    } catch (error) {
      console.error("Error subscribing to artist:", error);
    }
  }

  async unsubscribe(subscriptionKey: string): Promise<void> {
    const key = subscriptionKey.split("#").join("=");
    console.log(key)
      const token = getJwt();
      if (!token) {
          throw new Error("User is not authenticated");
      }
    try {
      const response = await fetch(`${API_URL}/subscriptions/${key}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to unsubscribe");
      }
    } catch (error) {
      console.error("Error unsubscribing from artist:", error);
    }
  }

  async getUserSubscriptions(): Promise<{ artistSubscriptions: Subscription[]; genreSubscriptions: Subscription[] }> {
    const token = getJwt();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    try {
      const response = await fetch(`${API_URL}/subscriptions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch subscriptions: ${errorText}`);
      }

      const data = await response.json();
      console.log(data);
      return {
        artistSubscriptions: data.artistSubscriptions || [],
        genreSubscriptions: data.genreSubscriptions || [],
      };
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      throw error;
    }
  }

}

export default new SubscribeService();