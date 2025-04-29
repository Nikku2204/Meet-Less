import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTable } from "@/components/data-table"

export function ParticipantOptimization({ data, filters }) {
  if (!data) return null

  const { participantOptimization } = data

  // Filter data based on filters
  const filteredData = participantOptimization.filter((item) => {
    if (filters.meetingType !== "all" && item.meetingType !== filters.meetingType) {
      return false
    }
    if (
      item.currentParticipants < filters.participantCount[0] ||
      item.currentParticipants > filters.participantCount[1]
    ) {
      return false
    }
    return true
  })

  // Table columns
  const columns = [
    {
      accessorKey: "meetingTitle",
      header: "Meeting",
    },
    {
      accessorKey: "meetingType",
      header: "Type",
    },
    {
      accessorKey: "currentParticipants",
      header: "Current",
    },
    {
      accessorKey: "optimalParticipants",
      header: "Optimal",
    },
    {
      accessorKey: "reduction",
      header: "Reduction",
    },
    {
      accessorKey: "timeSavings",
      header: "Time Savings",
      cell: ({ row }) => {
        return `${row.getValue("timeSavings")} min/month`
      },
    },
  ]

  // Prepare data for bar chart
  const chartData = filteredData.map((item) => ({
    name: item.meetingTitle.length > 15 ? item.meetingTitle.substring(0, 15) + "..." : item.meetingTitle,
    current: item.currentParticipants,
    optimal: item.optimalParticipants,
    reduction: item.reduction,
    fullName: item.meetingTitle,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant Optimization</CardTitle>
        <CardDescription>Identify meetings with too many non-speaking participants</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === "current"
                    ? "Current Participants"
                    : name === "optimal"
                      ? "Optimal Participants"
                      : "Reduction",
                ]}
                labelFormatter={(label, items) => {
                  const item = items[0]?.payload
                  return item ? item.fullName : label
                }}
              />
              <Legend />
              <Bar dataKey="current" name="Current Participants" fill="#94a3b8" />
              <Bar dataKey="optimal" name="Optimal Participants" fill="#22c55e" />
              <Bar dataKey="reduction" name="Reduction" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ScrollArea className="h-[300px]">
          <DataTable columns={columns} data={filteredData} title="Participant Optimization Recommendations" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
