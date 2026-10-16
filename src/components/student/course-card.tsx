import Link from "next/link";
import { Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  price: number;
  originalPrice: number | null;
  className: string | null;
  subject: string | null;
  teacherName: string | null;
  studentCount: number;
  ratingAvg: number | null;
}

export function CourseCard({
  title,
  slug,
  thumbnailUrl,
  price,
  originalPrice,
  className: courseClass,
  teacherName,
  studentCount,
  ratingAvg,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-brand-orange/20 to-brand-blue/20">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl font-bold text-brand-orange/40">DE</span>
          </div>
        )}
        {courseClass && (
          <Badge className="absolute left-3 top-3 bg-brand-blue text-white">
            {courseClass}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground">
          {title}
        </h3>

        {teacherName && (
          <p className="mt-1 text-xs text-muted-foreground">{teacherName}</p>
        )}

        {/* Rating & students */}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {ratingAvg != null && ratingAvg > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {ratingAvg.toFixed(1)}
            </span>
          )}
          {studentCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {studentCount.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          {price === 0 ? (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            >
              Free
            </Badge>
          ) : (
            <>
              <span className="text-lg font-bold text-brand-orange">
                &#8377;{price.toLocaleString("en-IN")}
              </span>
              {originalPrice != null && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  &#8377;{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
