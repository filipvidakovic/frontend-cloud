import type { Subscription } from "../pages/SubscriptionPage";

const API_URL = import.meta.env.VITE_API_URL;

function getJwtAndId() {
    const idToken = localStorage.getItem("token");
    const userId = localStorage.getItem("userId")!;
    return { token: idToken, userId };
}

export async function subscribeToArtist(data: {
      type: string,
      id: string,
      action: string,
      userId: string | undefined
    }): Promise<void> {
    const result = getJwtAndId();
    if (!result) {
        throw new Error("User is not authenticated");
    }
    const { token, userId }  = result;
    data.userId = userId
  try {
    const response = await fetch(`${API_URL}/subscriptions/${data.id}`, {
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

export async function unsubscribeFromArtist(subscriptionKey: string): Promise<void> {
    const result = getJwtAndId();
    if (!result) {
        throw new Error("User is not authenticated");
    }
    const { token }  = result;
  try {
    const response = await fetch(`${API_URL}/subscriptions/${subscriptionKey}`, {
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

export async function getUserSubscriptions(): Promise<Subscription[]> {
  const result = getJwtAndId();
  if (!result) {
    throw new Error("User is not authenticated");
  }

  const { token, userId } = result;

  try {
    const response = await fetch(`${API_URL}/subscriptions?userId=${userId}`, {
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
    console.log(data)
    return data.subscriptions;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
}
