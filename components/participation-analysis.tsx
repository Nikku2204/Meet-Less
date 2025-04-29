import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTable } from "@/components/data-table"

export function ParticipationAnalysis({ data, filters }) {
  if (!data) return null

  const { participationAnalysis, lowParticipationMeetings } = data

  // Filter data based on filters
  const filteredLowParticipation = lowParticipationMeetings.filter((item) => {
    if (filters.meetingType !== "all" && item.meetingType !== filters.meetingType) {
      return false
    }
    if (item.participantCount < filters.participantCount[0] || item.participantCount > filters.participantCount[1]) {
      return false
    }
    return true
  })

  // Group data by participation ratio ranges
  const participationRanges = [
    { range: "0-20%", min: 0, max: 0.2 },
    { range: "21-40%", min: 0.21, max: 0.4 },
    { range: "41-60%", min: 0.41, max: 0.6 },
    { range: "61-80%", min: 0.61, max: 0.8 },
    { range: "81-100%", min: 0.81, max: 1 },
  ]

  const participationData = participationRanges.map((range) => {
    const meetings = participationAnalysis.filter(
      (m) => m.participationRatio >= range.min && m.participationRatio <= range.max,
    )

    const decisionsYes = meetings.filter((m) => m.decisionMade === "Yes").length
    const decisionsNo = meetings.filter((m) => m.decisionMade === "No").length

    return {
      range: range.range,
      decisionsYes,
      decisionsNo,
      total: meetings.length,
      decisionRate: meetings.length > 0 ? decisionsYes / meetings.length : 0,
    }
  })

  // Table columns
  const columns = [
    {
      accessorKey: "meetingTitle",
      header: "Meeting",
    },
    {
      accessorKey: "participationRatio",
      header: "Participation",
      cell: ({ row }) => {
        return `${(row.getValue("participationRatio") * 100).toFixed(0)}%`
      },
    },
    {
      accessorKey: "participantCount",
      header: "Participants",
    },
    {
      accessorKey: "speakerCount",
      header: "Speakers",
    },
    {
      accessorKey: "potentialReduction",
      header: "Potential Reduction",
      cell: ({ row }) => {
        return row.getValue("potentialReduction")
      },
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Participation Analysis</CardTitle>
        <CardDescription>Analyzing participation ratios and decision outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="decisionsYes" name="Decisions Made" fill="#22c55e" />
              <Bar dataKey="decisionsNo" name="No Decisions" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip formatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Bar dataKey="decisionRate" name="Decision Rate">
                {participationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.decisionRate > 0.5 ? "#22c55e" : "#f59e0b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ScrollArea className="h-[200px]">
          <DataTable columns={columns} data={filteredLowParticipation} title="Low Participation Meetings" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
