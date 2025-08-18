import { FileText, ThumbsDown, ThumbsUp } from "lucide-react";
import { Badge } from "./ui/badge";

export default function RecommendationBadge({
  recommendation,
}: {
  recommendation: string;
}) {
  switch (recommendation) {
    case "ACCEPT":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <ThumbsUp className="w-3 h-3 mr-1" />
          Accept
        </Badge>
      );
    case "REJECT":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <ThumbsDown className="w-3 h-3 mr-1" />
          Reject
        </Badge>
      );
    case "MAJOR_REVISION":
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <FileText className="w-3 h-3 mr-1" />
          Major Revision
        </Badge>
      );
    case "MINOR_REVISION":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <FileText className="w-3 h-3 mr-1" />
          Minor Revision
        </Badge>
      );
    default:
      return <Badge variant="outline">{recommendation}</Badge>;
  }
}
