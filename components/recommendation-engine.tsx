import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function RecommendationEngine({ data, filters }) {
  if (!data) return null

  const { recommendations } = data

  // Filter recommendations based on filters
  const filteredRecommendations = recommendations.filter((item) => {
    if (filters.meetingType !== "all" && item.meetingType !== filters.meetingType) {
      return false
    }
    if (item.score < filters.scoreRange[0] || item.score > filters.scoreRange[1]) {
      return false
    }
    if (item.participants < filters.participantCount[0] || item.participants > filters.participantCount[1]) {
      return false
    }
    return true
  })

  // Group recommendations by category
  const lowValueRecs = filteredRecommendations.filter((r) => r.category === "low-value")
  const participantRecs = filteredRecommendations.filter((r) => r.category === "participant")
  const frequencyRecs = filteredRecommendations.filter((r) => r.category === "frequency")
  const keepRecs = filteredRecommendations.filter((r) => r.category === "keep")

  // Helper function to render recommendation card
  const renderRecommendationCard = (recommendation) => {
    const getBadgeColor = (category) => {
      switch (category) {
        case "low-value":
          return "bg-red-100 text-red-800"
        case "participant":
          return "bg-amber-100 text-amber-800"
        case "frequency":
          return "bg-blue-100 text-blue-800"
        case "keep":
          return "bg-green-100 text-green-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    const getIcon = (category) => {
      switch (category) {
        case "low-value":
          return <AlertCircle className="h-4 w-4 text-red-600" />
        case "participant":
          return <Users className="h-4 w-4 text-amber-600" />
        case "frequency":
          return <Clock className="h-4 w-4 text-blue-600" />
        case "keep":
          return <CheckCircle className="h-4 w-4 text-green-600" />
        default:
          return null
      }
    }

    return (
      <div key={recommendation.id} className="mb-4 p-4 border rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{recommendation.meetingTitle}</h3>
            <p className="text-sm text-muted-foreground">{recommendation.meetingType}</p>
          </div>
          <Badge className={getBadgeColor(recommendation.category)}>
            {getIcon(recommendation.category)}
            <span className="ml-1">{recommendation.category}</span>
          </Badge>
        </div>
        <p className="text-sm mb-2">{recommendation.recommendation}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {recommendation.participants} participants
          </span>
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {recommendation.duration} min
          </span>
          <span>Score: {recommendation.score.toFixed(2)}</span>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Recommendation Engine</CardTitle>
        <CardDescription>Specific recommendations to optimize your meetings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-red-600 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Convert to Async ({lowValueRecs.length})
            </h3>
            <ScrollArea className="h-[300px] pr-4">
              {lowValueRecs.map(renderRecommendationCard)}
              {lowValueRecs.length === 0 && (
                <p className="text-sm text-muted-foreground">No recommendations in this category</p>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <h3 className="font-semibold text-green-600 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Keep as Is ({keepRecs.length})
            </h3>
            <ScrollArea className="h-[300px] pr-4">
              {keepRecs.map(renderRecommendationCard)}
              {keepRecs.length === 0 && (
                <p className="text-sm text-muted-foreground">No recommendations in this category</p>
              )}
            </ScrollArea>
          </div>

          <div>
            <h3 className="font-semibold text-amber-600 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Optimize Participants ({participantRecs.length})
            </h3>
            <ScrollArea className="h-[300px] pr-4">
              {participantRecs.map(renderRecommendationCard)}
              {participantRecs.length === 0 && (
                <p className="text-sm text-muted-foreground">No recommendations in this category</p>
              )}
            </ScrollArea>

            <Separator className="my-4" />

            <h3 className="font-semibold text-blue-600 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Adjust Frequency ({frequencyRecs.length})
            </h3>
            <ScrollArea className="h-[300px] pr-4">
              {frequencyRecs.map(renderRecommendationCard)}
              {frequencyRecs.length === 0 && (
                <p className="text-sm text-muted-foreground">No recommendations in this category</p>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
