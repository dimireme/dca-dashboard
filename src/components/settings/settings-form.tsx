"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

type SettingsFieldsProps = {
  initialDcaStartDate: string;
  initialDailyAmount: string;
  showSetupHint: boolean;
};

function SettingsFields({
  initialDcaStartDate,
  initialDailyAmount,
  showSetupHint,
}: SettingsFieldsProps) {
  const updateSettings = useUpdateSettings();
  const [dcaStartDate, setDcaStartDate] = useState(initialDcaStartDate);
  const [dailyAmount, setDailyAmount] = useState(initialDailyAmount);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaved(false);

    await updateSettings.mutateAsync({
      dcaStartDate,
      dailyAmount: Number(dailyAmount),
    });

    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showSetupHint ? (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          No settings yet. Save your DCA plan to unlock the calendar.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="dca-start-date">DCA start date</Label>
        <Input
          id="dca-start-date"
          type="date"
          value={dcaStartDate}
          onChange={(event) => setDcaStartDate(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="daily-amount">Daily amount (USD)</Label>
        <Input
          id="daily-amount"
          type="number"
          min="0"
          step="0.01"
          value={dailyAmount}
          onChange={(event) => setDailyAmount(event.target.value)}
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={updateSettings.isPending}>
          Save settings
        </Button>
        {saved ? <span className="text-sm text-emerald-600">Saved</span> : null}
      </div>
    </form>
  );
}

export function SettingsForm() {
  const { data: settings, isLoading, isSuccess } = useSettings();

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>DCA plan settings</CardTitle>
        <CardDescription>
          Configure your DCA start date and target daily investment amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        ) : (
          <SettingsFields
            key={settings?.updatedAt ?? "new"}
            initialDcaStartDate={settings?.dcaStartDate ?? ""}
            initialDailyAmount={settings?.dailyAmount?.toString() ?? ""}
            showSetupHint={isSuccess && !settings}
          />
        )}
      </CardContent>
    </Card>
  );
}
