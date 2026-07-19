import Link from "next/link";
import { listTenants } from "@/lib/tenant/admin-repo";
import { logout } from "./actions";

export default async function AdminPage() {
  const tenants = await listTenants();

  return (
    <div>
      <div className="session-top">
        <h1>Clinics</h1>
        <form action={logout}>
          <button className="icon-btn" type="submit">
            Sign out
          </button>
        </form>
      </div>

      <div className="card">
        <Link className="big-btn" href="/admin/tenants/new">
          + New clinic
        </Link>
      </div>

      <div className="card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Clinic name</th>
              <th>Active</th>
              <th>Custom domain</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.slug}>
                <td>{t.slug}</td>
                <td>{t.clinicName}</td>
                <td>{t.active ? "Yes" : "No"}</td>
                <td>{t.customDomain ?? "—"}</td>
                <td>
                  <Link href={`/admin/tenants/${t.slug}`}>Edit →</Link>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={5}>No clinics yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
