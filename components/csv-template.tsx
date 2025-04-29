"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

export function CSVTemplate() {
  const downloadTemplate = () => {
    const csvContent = `Meeting_Title,Duration_Minutes,Participants,Actual_Speakers,Decision_Made,Agenda_Provided,Follow_Up_Sent,Could_Be_Async
Leadership Roundtable,60,12,3,No,Yes,Yes,Yes
Weekly Standup,30,8,5,No,No,No,Yes
Design Review,45,6,5,Yes,Yes,Yes,No
Sprint Planning,60,10,4,Yes,Yes,Yes,No
Customer Success Update,30,5,4,Yes,Yes,Yes,No`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "meeting_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" size="sm" onClick={downloadTemplate} className="flex items-center gap-1">
      <FileDown className="h-4 w-4" />
      Download Template
    </Button>
  )
}
