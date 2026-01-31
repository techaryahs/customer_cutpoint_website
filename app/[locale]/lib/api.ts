const API_BASE = "http://localhost:3001";

export async function fetchPlaces() {
  const token = localStorage.getItem("admin_token"); // already exists in admin login

  const res = await fetch(`${API_BASE}/view-place-details`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch places");
  }

  return res.json();
}
