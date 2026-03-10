import { createContext, useContext, useState, useEffect } from "react";
import { BASE_URL } from "../config";

const PermissionContext = createContext({ permissions: {}, loading: true });

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setPermissions({});
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/roles/my-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPermissions(data.permissions);
      }
    } catch {
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <PermissionContext.Provider
      value={{ permissions, loading, refetch: fetchPermissions }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePermissions = () => useContext(PermissionContext);
