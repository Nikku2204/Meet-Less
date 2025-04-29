import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function FileFormatHelp() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <p className="font-medium">Required CSV columns:</p>
            <ul className="text-xs space-y-1 list-disc pl-4">
              <li>
                <span className="font-medium">Meeting_Title</span>: Name of the meeting
              </li>
              <li>
                <span className="font-medium">Duration_Minutes</span>: Length of meeting in minutes
              </li>
              <li>
                <span className="font-medium">Participants</span>: Number of attendees
              </li>
              <li>
                <span className="font-medium">Actual_Speakers</span>: Number of people who spoke
              </li>
              <li>
                <span className="font-medium">Decision_Made</span>: "Yes" or "No"
              </li>
            </ul>
            <p className="text-xs">Optional columns: Agenda_Provided, Follow_Up_Sent, Could_Be_Async</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
