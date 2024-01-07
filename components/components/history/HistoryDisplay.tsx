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
          <li className="bg-white rounded-lg hover:border-slate-900 border border-slate-300 bor overflow-hidden" key={index}>
            <HoverCard>
              <HoverCardTrigger
                className={classNames(
                  "rounded-lg flex items-center justify-between space-x-2 flex-col",
                  "border-b cursor-pointer",
                  {
                   'text-block border-2 border-solid border-blue-500': index === currentVersion,
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
                <div className="flex gap-x-1 truncate">
                  {/* <h2 className="text-sm">{displayHistoryItemType(item.type)}</h2> */}
                  {item.parentIndex !== null &&
                  item.parentIndex !== index - 1 ? (
                    <h2 className="text-sm">
                      (parent: v{(item.parentIndex || 0) + 1})
                    </h2>
                  ) : null}
                  <h2 className="text-sm">v{index + 1}</h2>
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
