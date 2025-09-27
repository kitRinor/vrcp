import { PipelineContent, PipelineMessage } from "@/vrchat/pipline/type";
import { parseLocationString } from "../vrchat";

export function extractPipelineMessageContent(message: PipelineMessage): string[] {
  const res: string[] = []
  switch (message.type) {
    case "friend-location":
      const c_flo = message.content as PipelineContent<"friend-location">;
      res.push(`${c_flo.user.displayName ?? ""}`);
      if (c_flo.location) {
        const {parsedLocation: loc} = parseLocationString(c_flo.location);
        res.push(`${loc ? loc.worldId: c_flo.location}`);
      }
      break;
    case "friend-offline":
      const c_fof = message.content as PipelineContent<"friend-offline">;
      res.push(`${c_fof.userId}`);
      break;
    case "friend-online":
      const c_fon = message.content as PipelineContent<"friend-online">;
      res.push(`${c_fon.user.displayName ?? ""}`);
      if (c_fon.location) {
        const {parsedLocation: loc} = parseLocationString(c_fon.location);
        res.push(`${loc ? loc.worldId: c_fon.location}`);
      }
      break;
    case "friend-active":
      const c_fac = message.content as PipelineContent<"friend-active">;
      res.push(`${c_fac.user.displayName ?? ""}`);
      break;
    case "friend-update":
      const c_fup = message.content as PipelineContent<"friend-update">;
      res.push(`${c_fup.user.displayName ?? ""}`);
      break;
    case "friend-add":
      const c_fad = message.content as PipelineContent<"friend-add">;
      res.push(`${c_fad.user.displayName ?? ""}`);
      break;
    case "friend-delete":
      const c_fde = message.content as PipelineContent<"friend-delete">;
      res.push(`${c_fde.userId}`);
      break;
  }
  return res;
}