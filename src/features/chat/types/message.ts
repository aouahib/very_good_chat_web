import {Media} from "./media";

type Message = {
  id: number,
  conversationID: number,
  senderID: string,
  text?: string,
  medias?: Media[],
  sentAt: number,
  deliveredTo: string[],
  seenBy: string[],
}

export default Message;