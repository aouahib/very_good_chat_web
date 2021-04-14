import React, {useRef} from "react";
import {Avatar, makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import Message from "../../../types/message";
import Conversation from "../../../types/conversation";
import DeliveryStatus, {DeliveryStatusType} from "../delivery-status";
import MessageMediaGrid from "./message-media-grid";

export type MessageListItemProps = {
  conversation: Conversation,
  index: number,
  currentUserID: string,
};

const _sameSender = (message1: Message, message2: Message) => {
  return message1.senderID == message2.senderID;
};

const MessageListItem = React.memo((props: MessageListItemProps) => {
  const messages = props.conversation.messages;
  const index = props.index;
  const message = messages[index];
  const incoming = props.currentUserID != message.senderID;
  const otherUser = props.conversation.participants[0];
  const ref = useRef<HTMLDivElement>(null);
  let bubbleType: BubbleType;
  const before = messages[index - 1];
  const after = messages[index + 1];
  if (!before && !after) bubbleType = BubbleType.ISOLATED;
  else if (before && after) {
    if (_sameSender(message, before)) {
      if (_sameSender(message, after)) bubbleType = BubbleType.MIDDLE;
      else bubbleType = BubbleType.LAST;
    } else {
      if (_sameSender(message, after)) bubbleType = BubbleType.FIRST;
      else bubbleType = BubbleType.ISOLATED;
    }
  } else if (after) {
    if (_sameSender(message, after)) bubbleType = BubbleType.FIRST;
    else bubbleType = BubbleType.ISOLATED;
  } else {
    if (_sameSender(message, before)) bubbleType = BubbleType.LAST;
    else bubbleType = BubbleType.ISOLATED;
  }
  let deliveryStatusType: DeliveryStatusType;
  let date: number;
  if (incoming) {
    if (!after) deliveryStatusType = DeliveryStatusType.SEEN;
    else deliveryStatusType = DeliveryStatusType.NONE;
    date = message.sentAt;
  } else if (!message.sent) {
    deliveryStatusType = DeliveryStatusType.SENDING;
    date = message.sentAt;
  } else if (message.seenBy[0]) {
    const sb = message.seenBy[0];
    const lastSeen = props.conversation.seenDates[sb.userID] ?? 0;
    if (sb.date == lastSeen) {
      if (after && _sameSender(message, after) && after.seenBy[0]) {
        deliveryStatusType = DeliveryStatusType.NONE;
      } else {
        deliveryStatusType = DeliveryStatusType.SEEN;
      }
    } else deliveryStatusType = DeliveryStatusType.NONE;
    date = message.seenBy[0].date;
  } else if (message.deliveredTo[0]) {
    deliveryStatusType = DeliveryStatusType.DELIVERED;
    date = message.deliveredTo[0].date;
  } else {
    deliveryStatusType = DeliveryStatusType.SENT;
    date = message.sentAt;
  }
  const showIncomingAvatar = incoming
    && (!after || (after && !_sameSender(message, after)));
  const showDeliveryStatus = !incoming || (incoming && !after);
  const hasMedia = Boolean(message.medias && message.medias.length);

  const classes = useStyles({
    incoming,
    bubbleType,
    deliveryStatus: deliveryStatusType,
    hasMedia,
  });

  return (
    <div data-testid='message-list-item'>
      <div className={classes.wrapper} ref={ref}>
        <div className={classes.incomingAvatarWrapper}>
          {showIncomingAvatar &&
          <Avatar
            className={classes.incomingAvatar}
            src={otherUser.photo?.small}
          />}
        </div>
        <span className={classes.bubble}>
          {
            hasMedia &&
            <MessageMediaGrid medias={message.medias!} messageID={message.id}/>
          }
          {message.text &&
          <div className={classes.bubbleText}>{message.text}</div>}
        </span>
        <div className={classes.status}>
          {showDeliveryStatus &&
          <DeliveryStatus
            type={deliveryStatusType}
            date={date}
            photoURL={otherUser.photo?.small}
          />}
        </div>
      </div>
    </div>
  );
});

enum BubbleType {
  ISOLATED = 'ISOLATED',
  FIRST = 'FIRST',
  MIDDLE = 'MIDDLE',
  LAST = 'LAST'
}

type messageListItemProps = {
  incoming: boolean,
  bubbleType: BubbleType,
  deliveryStatus: DeliveryStatusType,
  hasMedia: boolean
}

const _getBorderRadius = (type: BubbleType): [string, string] => {
  switch (type) {
    case BubbleType.FIRST:
      return ['18px', '4px'];
    case BubbleType.LAST:
      return ['4px', '18px'];
    case BubbleType.MIDDLE:
      return ['4px', '4px'];
    case BubbleType.ISOLATED:
      return ['18px', '18px'];
  }
};

const useStyles = makeStyles<Theme, messageListItemProps>({
  wrapper: props => ({
    display: 'flex',
    justifyContent: props.incoming ? 'flex-start' : 'flex-end',
  }),
  bubble: props => {
    let background, color: string;
    let tl, tr, bl, br: string;
    if (props.incoming) {
      background = 'grey';
      color = 'black';
      tr = br = '18px';
      [tl, bl] = _getBorderRadius(props.bubbleType);
    } else {
      background = 'black';
      color = 'white';
      tl = bl = '18px';
      [tr, br] = _getBorderRadius(props.bubbleType);
    }
    return {
      margin: '1px',
      padding: '2px',
      maxWidth: '70%',
      overflowWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      borderRadius: `${tl} ${tr} ${br} ${bl}`,
      background,
      color
    };
  },
  bubbleText: {
    margin: '8px 12px',
  },
  status: {
    marginLeft: props => props.incoming ? 'auto' : '4px',
    marginRight: '4px',
    marginTop: 'auto',
    width: '14px',
    height: '14px',
  },
  incomingAvatarWrapper: {
    width: '28px',
    height: '28px',
    marginTop: 'auto',
    marginLeft: '8px',
    marginRight: '8px',
  },
  incomingAvatar: {
    width: '28px',
    height: '28px',
  }
});

export default MessageListItem;