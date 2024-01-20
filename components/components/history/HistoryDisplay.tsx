import { History, HistoryItemType } from "./history_types";
import toast from "react-hot-toast";
import classNames from "classnames";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../ui/hover-card";
import { Badge } from "../ui/badge";

interface Props {
  history: History;
  currentVersion: number | null;
  revertToVersion: (version: number) => void;
  shouldDisableReverts: boolean;
}

function displayHistoryItemType(itemType: HistoryItemType) {
  switch (itemType) {
    case "ai_create":
      return "Create";
    case "ai_edit":
      return "Edit";
    default: {
      const exhaustiveCheck: never = itemType;
      throw new Error(`Unhandled case: ${exhaustiveCheck}`);
    }
  }
}

export default function HistoryDisplay({
  history,
  currentVersion,
  revertToVersion,
  shouldDisableReverts,
}: Props) {
  return history && history.length === 0 ? null : (
    <div className="flex flex-col h-screen">
      <h1 className="font-bold mb-2">History</h1>
      <ul className="space-y-2 flex flex-col">
        {history && history.map((item, index) => (
          <li className="bg-white rounded-lg overflow-hidden" key={index}>
            <HoverCard>
              <HoverCardTrigger
                className={classNames(
                  "rounded-lg space-x-2 cursor-pointer w-full block border relative rounded-lg overflow-hidden",
                  {
                   'text-block border-sky-500 hover:border-sky-500': index === currentVersion,
                   'hover:border-slate-900 border-slate-300 ': index !== currentVersion,
                  }
                )}
                onClick={() =>
                  shouldDisableReverts
                    ? toast.error(
                        "Please wait for code generation to complete before viewing an older version."
                      )
                    : revertToVersion(index)
                }
              >
                {" "}
                <div className="bg-[length:160px_100px] bg-no-repeat bg-center w-full h-[80px]" 
                  style={
                    {
                      backgroundImage: `url(${item.screenshot || 'https://www.ancodeai.com/placeholder.svg'})`
                    }
                  }></div>
                <div className="flex absolute bottom-[6px] px-1 bg-blue-100 text-blue-600 border-blue-600 border rounded-sm">
                  {/* <h2 className="text-sm">{displayHistoryItemType(item.type)}</h2> */}
                  {item.parentIndex !== null &&
                  item.parentIndex !== index - 1 ? (
                    <span className="text-xs">
                      (p: v{(item.parentIndex || 0) + 1})
                    </span>
                  ) : null}
                  <span className="text-xs">v{index + 1}</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <div>
                  {item.type === "ai_edit" ? item.inputs.originMessage || item.inputs.prompt : "Create"}
                </div>
              </HoverCardContent>
            </HoverCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
