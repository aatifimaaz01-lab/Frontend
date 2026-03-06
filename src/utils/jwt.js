// utils/jwt.js
// Utility to decode JWT and extract role

export function getRoleFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch (e) {
    console.log(e);
    return null;
  }
}
