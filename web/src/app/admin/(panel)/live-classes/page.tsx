import type { Metadata } from "next";
import {
  listLiveClasses,
  listTeachers,
  listCoursesForSchedule,
} from "./actions";
import { LiveClassesContent } from "@/components/admin/live-classes/live-classes-content";

export const metadata: Metadata = {
  title: "Live Classes | Dream Edge Admin",
};


export default async function LiveClassesPage() {
  const [scheduled, live, pendingRecording, rewatchLibrary, teachers, courses] =
    await Promise.all([
      listLiveClasses("scheduled"),
      listLiveClasses("live"),
      listLiveClasses("pending_recording"),
      listLiveClasses("rewatch_library"),
      listTeachers(),
      listCoursesForSchedule(),
    ]);

  return (
    <LiveClassesContent
      scheduled={scheduled}
      live={live}
      pendingRecording={pendingRecording}
      rewatchLibrary={rewatchLibrary}
      teachers={teachers}
      courses={courses}
    />
  );
}
