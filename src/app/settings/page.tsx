import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Set up your DCA plan before recording purchases.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
