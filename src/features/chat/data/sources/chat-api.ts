import Conversation, {UsersLastSeen} from "../../types/conversation";
import Message, {Delivery} from "../../types/message";
import {ApolloClient} from "@apollo/client";
import {
  GetConversations,
  GetConversations_getConversations
} from "../../../../_generated/GetConversations";
import {
  GET_CONVERSATIONS,
  GET_OR_CREATE_OTO_CONVERSATION,
  SEND_MESSAGE,
  SUBSCRIBE_TO_MESSAGE
} from "../graphql";
import {UserAPI} from "../../../user/data/sources/user-api";
import {ConversationType} from "../../../../_generated/globalTypes";
import {
  SendMessage,
  SendMessage_sendMessage,
  SendMessage_sendMessage_deliveredTo,
  SendMessage_sendMessage_medias,
  SendMessageVariables
} from "../../../../_generated/SendMessage";
import {Media, MediaType} from "../../types/media";
import {
  GetOrCreateOTOConversation,
  GetOrCreateOTOConversationVariables
} from "../../../../_generated/GetOrCreateOTOConversation";
import {SubscribeToMessages} from "../../../../_generated/SubscribeToMessages";
import {Observable} from "@apollo/client/utilities/observables/Observable";

export interface IChatAPI {
  getConversations(): Promise<Conversation[]>;

  getOrCreateOTOConversation(userID: string): Promise<Conversation>;

  sendMessage(input: SendMessageInput): Promise<Message>;

  subscribeToMessages(): Observable<Message>;
}

export default class ChatAPI implements IChatAPI {
  private readonly _client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this._client = client;
  }

  async getConversations(): Promise<Conversation[]> {
    const {data} = await this._client.query<GetConversations>({
      query: GET_CONVERSATIONS
    });
    return data.getConversations.map(ChatAPI.parseConversation);
  }

  async getOrCreateOTOConversation(userID: string): Promise<Conversation> {
    const {data} = await this._client.mutate<GetOrCreateOTOConversation, GetOrCreateOTOConversationVariables>({
      mutation: GET_OR_CREATE_OTO_CONVERSATION,
      variables: {userID}
    });
    return ChatAPI.parseConversation(data?.getOrCreateOneToOneConversation!);
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const {data} = await this._client.mutate<SendMessage, SendMessageVariables>({
      mutation: SEND_MESSAGE,
      variables: {message: input}
    });
    return ChatAPI.parseMessage(data?.sendMessage!);
  }

  subscribeToMessages(): Observable<Message> {
    const sub = this._client.subscribe<SubscribeToMessages>({
      query: SUBSCRIBE_TO_MESSAGE,
      fetchPolicy: 'no-cache'
    });
    return sub
      .filter(({data}) => Boolean(data?.subscribeToMessages))
      .map(({data}) => ChatAPI.parseMessage(data!.subscribeToMessages));
  }

  static parseConversation(conv: GetConversations_getConversations): Conversation {
    const seenDates: UsersLastSeen = {};
    let pIDs: string[] = [];
    conv.participants.forEach(p => {
      seenDates[p.id] = 0;
      pIDs.push(p.id);
    });
    let mIdx = conv.messages.length - 1;
    while (mIdx >= 0 && pIDs.length) {
      const message = conv.messages[mIdx];
      for (let seenBy of message.seenBy) {
        if (pIDs.indexOf(seenBy.userID) != -1) {
          seenDates[seenBy.userID] = message.sentAt;
          pIDs = pIDs.filter(id => id != seenBy.userID);
        }
      }
      mIdx--;
    }
    return {
      id: conv.id,
      participants: conv.participants.map(UserAPI.parseUser),
      messages: conv.messages.map(ChatAPI.parseMessage),
      type: ConversationType[conv.type],
      seenDates
    };
  }

  static parseMessage(message: SendMessage_sendMessage): Message {
    return {
      id: message.id,
      conversationID: message.conversationID,
      senderID: message.senderID,
      text: message.text ?? undefined,
      medias: message.medias?.map(ChatAPI.parseMedia),
      sentAt: message.sentAt,
      deliveredTo: message.deliveredTo.map(ChatAPI.parseDelivery),
      seenBy: message.seenBy.map(ChatAPI.parseDelivery),
      sent: true
    };
  }

  static parseMedia(media: SendMessage_sendMessage_medias): Media {
    return {
      url: media.url,
      type: MediaType[media.type]
    };
  }

  static parseDelivery(delivery: SendMessage_sendMessage_deliveredTo): Delivery {
    return {userID: delivery.userID, date: delivery.date};
  }
}

export type SendMessageInput = {
  conversationID: number,
  text?: string,
  medias?: File[]
}