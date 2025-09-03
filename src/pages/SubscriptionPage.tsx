import React, { useEffect, useState } from "react";
import { getUserSubscriptions, unsubscribeFromArtist } from "../services/SubscribeService";
// import AuthService from "../services/AuthService";
import ArtistService from "../services/ArtistService";
import type { ArtistCardProps } from "../models/Artist";

export interface Subscription {
  subscriptionId: string;
  subscriptionType: string;
  createdAt: string;
  targetId: string;
}

interface Artist {
  artistId: string;
  name: string;
  lastname: string;
  age: number;
  bio: string;
  genres: string[];
}

interface User {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthdate: string;
}

const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<(Subscription & { details?: Artist | User })[]>([]);
  const [artists, setArtists] = useState<{ [key: string]: ArtistCardProps } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subs: Subscription[] = await getUserSubscriptions();
        subs.forEach(async (sub) => {
          const artist: ArtistCardProps = await ArtistService.getArtistById(sub.targetId);
          setArtists((prev) => ({ ...prev, [sub.targetId]: artist }));
        });
        setSubscriptions(subs);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return <div>Loading subscriptions...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (subscriptions.length === 0) {
    return <div>No subscriptions found.</div>;
  }

  async function handleUnsubscribe(subscriptionId: string): Promise<void> {
    try {
      await unsubscribeFromArtist(subscriptionId);
      setSubscriptions((prev) => prev.filter((s) => s.subscriptionId !== subscriptionId));
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  }

    return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Artist Subscriptions</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((sub) => (
          <div
            key={sub.subscriptionId}
            className="rounded-xl shadow-lg border p-4 bg-white"
          >
            {sub.targetId ? (
              <>
                <h3 className="text-lg font-semibold">
                  {artists?.artistId.name} {artists?.artistId.lastname}
                </h3>
                <p className="text-sm text-gray-600">
                  Subscribed on {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                <p>Genres: {artists?.artistId.genres.join(", ")}</p>
                <p className="text-gray-700">{artists?.artistId.bio}</p>
              </>
            ) : (
              <p className="text-red-500">Artist data not found</p>
            )}

            <button
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded-lg"
              onClick={() => handleUnsubscribe(sub.subscriptionId)}
            >
              Unsubscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
