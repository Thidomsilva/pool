import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="p-4 md:p-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>
             <Skeleton className="h-7 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full max-w-sm" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <Skeleton className="h-32 w-full" />
             <div className="flex items-center space-x-2">
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-px w-full" />
             </div>
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
