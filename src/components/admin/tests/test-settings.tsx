"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTestBuilder } from "@/stores/test-builder";

interface CourseOption {
  id: string;
  title: string;
}

interface TestSettingsProps {
  courses: CourseOption[];
}

export function TestSettings({ courses }: TestSettingsProps) {
  const settings = useTestBuilder((s) => s.settings);
  const setSettings = useTestBuilder((s) => s.setSettings);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Test Settings
        </h3>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Course</label>
        <select
          value={settings.course_id}
          onChange={(e) => setSettings({ course_id: e.target.value })}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">No course (standalone)</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Instructions</label>
        <Textarea
          value={settings.instructions}
          onChange={(e) => setSettings({ instructions: e.target.value })}
          placeholder="Instructions for students before starting the test..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Duration (min)
          </label>
          <Input
            type="number"
            min={1}
            max={600}
            value={settings.duration_minutes}
            onChange={(e) =>
              setSettings({ duration_minutes: parseInt(e.target.value) || 60 })
            }
            className="h-9"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Max Attempts
          </label>
          <Input
            type="number"
            min={1}
            max={100}
            value={settings.max_attempts}
            onChange={(e) =>
              setSettings({ max_attempts: parseInt(e.target.value) || 1 })
            }
            className="h-9"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Passing Percentage
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={settings.pass_percentage}
            onChange={(e) =>
              setSettings({ pass_percentage: parseInt(e.target.value) || 0 })
            }
            className="h-9 w-20"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Shuffle Questions</label>
          <Switch
            checked={settings.shuffle_questions}
            onCheckedChange={(v) => setSettings({ shuffle_questions: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Show Results</label>
          <Switch
            checked={settings.show_results_immediately}
            onCheckedChange={(v) => setSettings({ show_results_immediately: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Certificate on Pass</label>
          <Switch
            checked={settings.certificate_enabled}
            onCheckedChange={(v) => setSettings({ certificate_enabled: v })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Negative Marking</label>
          <Switch
            checked={settings.negative_marking}
            onCheckedChange={(v) => setSettings({ negative_marking: v })}
          />
        </div>
      </div>
    </div>
  );
}
