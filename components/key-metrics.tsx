import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, CheckCircle2, XCircle } from "lucide-react"

export function KeyMetrics({ data }) {
  if (!data) return null

  const { totalMeetings, decisionRate, asyncPercentage, lowValueMeetings, totalWastedMinutes } = data.keyMetrics

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMeetings}</div>
          <p className="text-xs text-muted-foreground">Meetings analyzed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Decision Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{decisionRate}%</div>
          <p className="text-xs text-muted-foreground">Meetings with decisions made</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Could Be Async</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{asyncPercentage}%</div>
          <p className="text-xs text-muted-foreground">Meetings that could be async</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Wasted</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWastedMinutes} min</div>
          <p className="text-xs text-muted-foreground">{lowValueMeetings} low-value meetings</p>
        </CardContent>
      </Card>
    </div>
  )
}
