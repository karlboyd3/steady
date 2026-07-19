import { notFound } from "next/navigation";
import { TenantForm } from "@/components/admin/TenantForm";
import { getTenantForAdmin } from "@/lib/tenant/admin-repo";
import { updateTenantAction } from "../../actions";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await getTenantForAdmin(slug);
  if (!tenant) notFound();

  return (
    <div>
      <div className="session-top">
        <h1>{tenant.clinicName}</h1>
      </div>
      <TenantForm
        action={updateTenantAction}
        initial={tenant}
        slugEditable={false}
        submitLabel="Save changes"
      />
    </div>
  );
}
