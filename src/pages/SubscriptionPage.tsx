import React, { useEffect, useState } from "react";
import SubscribeService from "../services/SubscribeService";
import ArtistService from "../services/ArtistService";
import type { ArtistCardProps } from "../models/Artist";

export interface Subscription {
  subscriptionId: string;
  subscriptionType: string;
  createdAt: string;
  targetId: string;
}

const SubscriptionsPage: React.FC = () => {
  const [artistSubs, setArtistSubs] = useState<Subscription[]>([]);
  const [genreSubs, setGenreSubs] = useState<Subscription[]>([]);
  const [artists, setArtists] = useState<Record<string, ArtistCardProps>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { artistSubscriptions, genreSubscriptions } =
          await SubscribeService.getUserSubscriptions();

        // Fetch artist details for each artist subscription
        const artistsData = await Promise.all(
          artistSubscriptions.map(async (sub) => {
            const artist: ArtistCardProps = await ArtistService.getArtistById(
              sub.targetId
            );
            return { id: sub.targetId, artist };
          })
        );

        const artistMap = artistsData.reduce(
          (acc, { id, artist }) => ({ ...acc, [id]: artist }),
          {} as Record<string, ArtistCardProps>
        );

        setArtists(artistMap);
        setArtistSubs(artistSubscriptions);
        setGenreSubs(genreSubscriptions);
        console.log(artistSubscriptions, genreSubscriptions);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  async function handleUnsubscribe(subscriptionId: string): Promise<void> {
    try {
      await SubscribeService.unsubscribe(subscriptionId);
      setArtistSubs((prev) =>
        prev.filter((s) => s.subscriptionId !== subscriptionId)
      );
      setGenreSubs((prev) =>
        prev.filter((s) => s.subscriptionId !== subscriptionId)
      );
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  }

  if (loading) {
    return <div>Loading subscriptions...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (artistSubs.length === 0 && genreSubs.length === 0) {
    return <div>No subscriptions found.</div>;
  }

  return (
    <div className="p-4">
      {/* Artist Subscriptions */}
      <h2 className="text-xl font-bold mb-4">Your Artist Subscriptions</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {artistSubs.map((sub) => {
          const artist = artists[sub.targetId];
          return (
            <div
              key={sub.subscriptionId}
              className="rounded-xl shadow-lg border p-4 bg-white"
            >
              {artist ? (
                <>
                  <h3 className="text-lg font-semibold">
                    {artist.name} {artist.lastname}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Subscribed on{" "}
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                  <p>Genres: {artist.genres?.join(", ")}</p>
                  <p className="text-gray-700">{artist.bio}</p>
                </>
              ) : (
                <p className="text-red-500">Artist data not found</p>
              )}
              <button
                className="mt-2 bg-red-500  px-3 py-1 rounded-lg"
                onClick={() => handleUnsubscribe(sub.subscriptionId)}
              >
                Unsubscribe
              </button>
            </div>
          );
        })}
      </div>

      {/* Genre Subscriptions */}
      <h2 className="text-xl font-bold mt-8 mb-4">Your Genre Subscriptions</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {genreSubs.map((sub) => (
          <div
            key={sub.subscriptionId}
            className="rounded-xl shadow-lg border p-4 bg-white"
          >
            <h3 className="text-lg font-semibold">{sub.targetId}</h3>
            <p className="text-sm text-gray-600">
              Subscribed on {new Date(sub.createdAt).toLocaleDateString()}
            </p>
            <button
              className="mt-2 bg-red-500 px-3 py-1 rounded-lg"
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
