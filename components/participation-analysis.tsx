import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Label } from "recharts"
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

  // Custom tooltip for the decision distribution chart
  const DecisionDistributionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">Participation Range: {label}</p>
          <p className="text-sm">
            Decisions Made: <span className="font-medium">{data.decisionsYes}</span>
          </p>
          <p className="text-sm">
            No Decisions: <span className="font-medium">{data.decisionsNo}</span>
          </p>
          <p className="text-sm">
            Total Meetings: <span className="font-medium">{data.total}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Custom tooltip for the decision rate chart
  const DecisionRateTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">Participation Range: {label}</p>
          <p className="text-sm">
            Decision Rate: <span className="font-medium">{(data.decisionRate * 100).toFixed(0)}%</span>
          </p>
          <p className="text-sm">
            Total Meetings: <span className="font-medium">{data.total}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Participation Analysis</CardTitle>
        <CardDescription>Analyzing participation ratios and decision outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <h3 className="text-sm font-medium">Decision Distribution by Participation Level</h3>
          <p className="text-xs text-muted-foreground">
            Shows how decisions correlate with different participation rates
          </p>
        </div>
        <div className="h-[250px] mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range">
                <Label value="Participation Rate Range" position="bottom" offset={0} />
              </XAxis>
              <YAxis>
                <Label value="Number of Meetings" position="insideLeft" angle={-90} offset={-5} />
              </YAxis>
              <Tooltip content={<DecisionDistributionTooltip />} />
              <Legend />
              <Bar dataKey="decisionsYes" name="Decisions Made" fill="#22c55e" />
              <Bar dataKey="decisionsNo" name="No Decisions" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-medium">Decision Rate by Participation Level</h3>
          <p className="text-xs text-muted-foreground">
            Shows the percentage of meetings with decisions at each participation level
          </p>
        </div>
        <div className="h-[250px] mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={participationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range">
                <Label value="Participation Rate Range" position="bottom" offset={0} />
              </XAxis>
              <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}>
                <Label value="Decision Rate (%)" position="insideLeft" angle={-90} offset={-5} />
              </YAxis>
              <Tooltip content={<DecisionRateTooltip />} />
              <Bar dataKey="decisionRate" name="Decision Rate">
                {participationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.decisionRate > 0.5 ? "#22c55e" : "#f59e0b"} />
                ))}
                <Label position="top" formatter={(value) => `${(value * 100).toFixed(0)}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-medium">Low Participation Meetings</h3>
          <p className="text-xs text-muted-foreground">
            Meetings with participation ratio below 30% that could be optimized
          </p>
        </div>
        <ScrollArea className="h-[200px]">
          <DataTable columns={columns} data={filteredLowParticipation} />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
