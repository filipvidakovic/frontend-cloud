import React, { useMemo, useState } from "react";
import type { ArtistCardProps } from "../../models/Artist";
import "./ArtistCard.css";
import SubscribeService from "../../services/SubscribeService";
import ArtistService from "../../services/ArtistService";
import { toast } from "react-toastify";

type Props = ArtistCardProps & {
  canEdit?: boolean;
  onEdit?: (artistId: string) => void;      // still supported if you want it
  onDeleted?: (artistId: string) => void;   // parent can still remove the card
};

const ArtistCard: React.FC<Props> = ({
  artistId,
  name,
  lastname,
  age,
  bio,
  genres,
  canEdit = true,
  onEdit,
  onDeleted,
}) => {
  // ---- local displayed values (what the card shows) ----
  const [view, setView] = useState({
    name: name || "",
    lastname: lastname || "",
    age: typeof age === "number" ? age : undefined as number | undefined,
    bio: bio || "",
    genres: Array.isArray(genres) ? genres : [] as string[],
  });

  // ---- edit modal state ----
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    name: view.name,
    lastname: view.lastname,
    age: view.age != null ? String(view.age) : "",
    bio: view.bio,
    genresText: (view.genres || []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  // keep form defaults in sync with latest view when modal is closed
  useMemo(() => {
    if (!showEdit) {
      setForm({
        name: view.name,
        lastname: view.lastname,
        age: view.age != null ? String(view.age) : "",
        bio: view.bio,
        genresText: (view.genres || []).join(", "),
      });
    }
  }, [showEdit, view.name, view.lastname, view.age, view.bio, view.genres]);

  function subscribe(artistId: string): void {
    const data = { type: "artist", id: artistId, action: "subscribe", userId: undefined };
    SubscribeService.subscribe(data);
    toast.success("Subscribed to artist");
  }

  async function handleDelete() {
    const ok = window.confirm(`Delete artist "${view.name} ${view.lastname}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await ArtistService.deleteArtist(artistId);
      toast.success("Artist deleted");
      onDeleted?.(artistId);
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete artist");
    }
  }

  function openEdit() {
    onEdit?.(artistId);
    setShowEdit(true);
  }
  function closeEdit() {
    if (!saving) setShowEdit(false);
  }

  function onChange<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const payload: any = {};
    if (form.name.trim() !== "") payload.name = form.name.trim();
    if (form.lastname.trim() !== "") payload.lastname = form.lastname.trim();

    const ageStr = (form.age ?? "").trim();
    if (ageStr !== "") {
      const n = Number(ageStr);
      if (!Number.isFinite(n)) {
        toast.error("Age must be a number");
        return;
      }
      payload.age = n;
    }

    payload.bio = form.bio ?? "";

    const parsedGenres = form.genresText
      .split(",")
      .map(g => g.trim())
      .filter(Boolean);
    if (parsedGenres.length > 0) payload.genres = Array.from(new Set(parsedGenres));

    setSaving(true);
    try {
      await ArtistService.updateArtist(artistId, payload);
      toast.success("Artist updated");

      // merge payload into local view so card updates immediately
      setView(prev => ({
        name: payload.name ?? prev.name,
        lastname: payload.lastname ?? prev.lastname,
        age: (payload.age !== undefined ? payload.age : prev.age),
        bio: payload.bio ?? prev.bio,
        genres: payload.genres ?? prev.genres,
      }));

      setShowEdit(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update artist");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="card artist-card h-100">
        <div className="card-body d-flex flex-column justify-content-between p-4">
          <div className="d-flex align-items-start justify-content-between gap-3">
            <div>
              <h5 className="card-title artist-name mb-1">
                {view.name} {view.lastname}
              </h5>
              {typeof view.age === "number" && (
                <div className="text-muted small">Age: {view.age}</div>
              )}
            </div>

            {canEdit && (
              <div className="btn-toolbar gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={openEdit}
                  aria-label="Edit artist"
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleDelete}
                  aria-label="Delete artist"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {view.bio && (
            <p className="card-text artist-bio mb-3">
              {view.bio.length > 100 ? view.bio.substring(0, 100) + "..." : view.bio}
            </p>
          )}

          {view.genres?.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-auto mb-3">
              {view.genres.map((genre, idx) => (
                <span key={idx} className="badge genre-badge">
                  {genre}
                </span>
              ))}
            </div>
          )}

          <button
            className="btn btn-sm btn-outline-primary mb-1"
            onClick={() => subscribe(artistId)}
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* ---- EDIT MODAL ---- */}
      {showEdit && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={saveEdit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit artist</h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={closeEdit}
                      disabled={saving}
                    />
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">First name</label>
                        <input
                          className="form-control"
                          value={form.name}
                          onChange={e => onChange("name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last name</label>
                        <input
                          className="form-control"
                          value={form.lastname}
                          onChange={e => onChange("lastname", e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Age</label>
                        <input
                          className="form-control"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={form.age}
                          onChange={e => onChange("age", e.target.value)}  // keep string in form
                          placeholder={view.age != null ? String(view.age) : "(optional)"}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Bio</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={form.bio}
                          onChange={e => onChange("bio", e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Genres (comma-separated)</label>
                        <input
                          className="form-control"
                          value={form.genresText}
                          onChange={e => onChange("genresText", e.target.value)}
                          placeholder="rock, indie, pop"
                        />
                        <small className="text-muted">
                          Example: <code>rock, indie, pop</code>
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={closeEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default ArtistCard;
