"use client";

import { useState, useTransition, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";
import {
  getSettings,
  updateSettings,
} from "@/app/admin/(panel)/settings/actions";
import type { SiteSettingRow } from "@/app/admin/(panel)/settings/actions";

interface PlatformSettingsProps {
  initialData: SiteSettingRow[];
}

function parseValue<T>(setting: SiteSettingRow | undefined, fallback: T): T {
  if (!setting) return fallback;
  return setting.value as T;
}

export function PlatformSettings({ initialData }: PlatformSettingsProps) {
  const settingsMap = new Map<string, SiteSettingRow>();
  initialData.forEach((s) => settingsMap.set(s.key, s));

  const [platformName, setPlatformName] = useState(
    parseValue(settingsMap.get("platform_name"), "Dream Edge Online")
  );
  const [tagline, setTagline] = useState(
    parseValue(settingsMap.get("tagline"), "")
  );
  const [supportEmail, setSupportEmail] = useState(
    parseValue(settingsMap.get("support_email"), "")
  );
  const [supportPhone, setSupportPhone] = useState(
    parseValue(settingsMap.get("support_phone"), "")
  );

  const socialLinksRaw = parseValue(settingsMap.get("social_links"), {
    youtube: "",
    instagram: "",
    telegram: "",
    whatsapp: "",
  });
  const [youtube, setYoutube] = useState(
    (socialLinksRaw as Record<string, string>).youtube ?? ""
  );
  const [instagram, setInstagram] = useState(
    (socialLinksRaw as Record<string, string>).instagram ?? ""
  );
  const [telegram, setTelegram] = useState(
    (socialLinksRaw as Record<string, string>).telegram ?? ""
  );
  const [whatsapp, setWhatsapp] = useState(
    (socialLinksRaw as Record<string, string>).whatsapp ?? ""
  );

  const [maintenanceMode, setMaintenanceMode] = useState(
    parseValue(settingsMap.get("maintenance_mode"), false)
  );
  const [registrationOpen, setRegistrationOpen] = useState(
    parseValue(settingsMap.get("student_registration_open"), true)
  );
  const [razorpayEnabled, setRazorpayEnabled] = useState(
    parseValue(settingsMap.get("razorpay_enabled"), true)
  );
  const [manualPaymentEnabled, setManualPaymentEnabled] = useState(
    parseValue(settingsMap.get("manual_payment_enabled"), true)
  );
  const [referralEnabled, setReferralEnabled] = useState(
    parseValue(settingsMap.get("referral_system_enabled"), true)
  );
  const [watermarkEnabled, setWatermarkEnabled] = useState(
    parseValue(settingsMap.get("watermark_enabled"), true)
  );

  const [freeTrialDays, setFreeTrialDays] = useState(
    parseValue(settingsMap.get("free_trial_days"), 7)
  );
  const [maxDevices, setMaxDevices] = useState(
    parseValue(settingsMap.get("max_devices_per_student"), 2)
  );
  const [videoQuality, setVideoQuality] = useState(
    parseValue(settingsMap.get("video_quality_default"), "720p")
  );

  const [savingSection, setSavingSection] = useState<string | null>(null);

  async function saveSection(
    section: string,
    entries: { key: string; value: unknown }[]
  ) {
    setSavingSection(section);
    const result = await updateSettings(entries);
    setSavingSection(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${section} settings saved.`);
  }

  function handleSaveGeneral() {
    saveSection("General", [
      { key: "platform_name", value: platformName },
      { key: "tagline", value: tagline },
      { key: "support_email", value: supportEmail },
      { key: "support_phone", value: supportPhone },
    ]);
  }

  function handleSaveSocial() {
    saveSection("Social Links", [
      {
        key: "social_links",
        value: { youtube, instagram, telegram, whatsapp },
      },
    ]);
  }

  function handleSaveToggles() {
    saveSection("Feature Toggles", [
      { key: "maintenance_mode", value: maintenanceMode },
      { key: "student_registration_open", value: registrationOpen },
      { key: "razorpay_enabled", value: razorpayEnabled },
      { key: "manual_payment_enabled", value: manualPaymentEnabled },
      { key: "referral_system_enabled", value: referralEnabled },
      { key: "watermark_enabled", value: watermarkEnabled },
    ]);
  }

  function handleSaveLimits() {
    saveSection("Limits", [
      { key: "free_trial_days", value: freeTrialDays },
      { key: "max_devices_per_student", value: maxDevices },
      { key: "video_quality_default", value: videoQuality },
    ]);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">General</h3>
          <Button
            size="sm"
            onClick={handleSaveGeneral}
            disabled={savingSection === "General"}
          >
            {savingSection === "General" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input
              id="platform-name"
              value={platformName as string}
              onChange={(e) => setPlatformName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={tagline as string}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input
              id="support-email"
              type="email"
              value={supportEmail as string}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-phone">Support Phone</Label>
            <Input
              id="support-phone"
              type="tel"
              value={supportPhone as string}
              onChange={(e) => setSupportPhone(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Social Links</h3>
          <Button
            size="sm"
            onClick={handleSaveSocial}
            disabled={savingSection === "Social Links"}
          >
            {savingSection === "Social Links" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="youtube">YouTube URL</Label>
            <Input
              id="youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram URL</Label>
            <Input
              id="telegram"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="https://t.me/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Feature Toggles</h3>
          <Button
            size="sm"
            onClick={handleSaveToggles}
            disabled={savingSection === "Feature Toggles"}
          >
            {savingSection === "Feature Toggles" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label>Maintenance Mode</Label>
                {maintenanceMode && (
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Site will show a maintenance page to students.
              </p>
            </div>
            <Switch
              checked={maintenanceMode as boolean}
              onCheckedChange={(v) => setMaintenanceMode(v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Student Registration Open</Label>
              <p className="text-xs text-muted-foreground">
                Allow new student sign-ups on the platform.
              </p>
            </div>
            <Switch
              checked={registrationOpen as boolean}
              onCheckedChange={(v) => setRegistrationOpen(v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Razorpay Payments</Label>
              <p className="text-xs text-muted-foreground">
                Enable online payment processing via Razorpay.
              </p>
            </div>
            <Switch
              checked={razorpayEnabled as boolean}
              onCheckedChange={(v) => setRazorpayEnabled(v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Manual Payments</Label>
              <p className="text-xs text-muted-foreground">
                Allow recording of cash, UPI, and bank transfer payments.
              </p>
            </div>
            <Switch
              checked={manualPaymentEnabled as boolean}
              onCheckedChange={(v) => setManualPaymentEnabled(v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Referral System</Label>
              <p className="text-xs text-muted-foreground">
                Enable referral codes and discount tracking.
              </p>
            </div>
            <Switch
              checked={referralEnabled as boolean}
              onCheckedChange={(v) => setReferralEnabled(v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Video Watermark</Label>
              <p className="text-xs text-muted-foreground">
                Overlay student info watermark on video playback.
              </p>
            </div>
            <Switch
              checked={watermarkEnabled as boolean}
              onCheckedChange={(v) => setWatermarkEnabled(v)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Limits</h3>
          <Button
            size="sm"
            onClick={handleSaveLimits}
            disabled={savingSection === "Limits"}
          >
            {savingSection === "Limits" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="free-trial">Free Trial Days</Label>
            <Input
              id="free-trial"
              type="number"
              min={0}
              value={freeTrialDays as number}
              onChange={(e) => setFreeTrialDays(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-devices">Max Devices per Student</Label>
            <Input
              id="max-devices"
              type="number"
              min={1}
              value={maxDevices as number}
              onChange={(e) => setMaxDevices(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Video Quality</Label>
            <Select
              value={videoQuality as string}
              onValueChange={(v) => v && setVideoQuality(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="360p">360p</SelectItem>
                <SelectItem value="480p">480p</SelectItem>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
}
