import { TenantForm } from "@/components/admin/TenantForm";
import { createTenantAction } from "../../actions";

export default function NewTenantPage() {
  return (
    <div>
      <div className="session-top">
        <h1>New clinic</h1>
      </div>
      <TenantForm action={createTenantAction} slugEditable submitLabel="Create clinic" />
    </div>
  );
}
