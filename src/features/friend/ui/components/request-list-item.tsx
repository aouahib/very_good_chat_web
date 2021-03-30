import {FriendRequest} from "../../types/friend-request";
import React, {useCallback} from "react";
import User from "../../../user/types/user";
import {
  Avatar,
  Badge,
  Icon,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import {PulseLoader} from "react-spinners";
import {formatDate} from "../../../../utils/date-utils";
import Friend from "../../types/friend";

export type RequestListItemProps = {
  req: FriendRequest,
  style?: React.CSSProperties
  confirmed?: Boolean,
  received?: Boolean,
  loading?: Boolean
  onClick?: (user: User) => void,
  onAccept?: (user: User) => void,
  onCancel?: (user: User) => void,
}
const RequestListItem = (props: RequestListItemProps) => {
  const user = props.req.user;

  const onClick = useCallback(() => {
    if (props.onClick) props.onClick(user);
  }, [props.onClick]);

  const onAccept = useCallback(() => {
    if (props.onAccept) props.onAccept(user);
  }, [props.onClick]);

  const onCancel = useCallback(() => {
    if (props.onCancel) props.onCancel(user);
  }, [props.onClick]);

  const classes = useStyles();
  let online = false;
  let lastSeen: string | undefined;
  if (props.confirmed) {
    const friend = props.req as Friend;
    if (friend.lastSeen) {
      online = new Date().getTime() - friend.lastSeen <= 6000;
      lastSeen = formatDate(friend.lastSeen, 'mini');
    }
  }
  return (
    <div style={props.style} data-testid='request-list-item'>
      <ListItem
        className={classes.item}
        onClick={onClick}
        button>
        <ListItemAvatar>
          <Badge
            variant={online ? 'dot' : 'standard'}
            badgeContent={lastSeen}
            invisible={!online && !lastSeen}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            className={online ? classes.dot : classes.badge}
          >
            <Avatar src={user.photo?.small} alt='request-avatar'/>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={user.username}
          secondary={formatDate(props.req.date)}
        />
      </ListItem>
      {!props.confirmed &&
      <div className={classes.actions} data-testid='request-actions'>
        {props.loading &&
        <span data-testid='request-loading'>
            <PulseLoader size={10} color='grey'/>
          </span>}
        {!props.loading &&
        <IconButton aria-label="cancel" onClick={onCancel}
                    data-testid='cancel-request'>
          <Icon className={classes.clear}>clear</Icon>
        </IconButton>}
        {!props.loading && props.received &&
        <IconButton aria-label="accept" onClick={onAccept}
                    data-testid='accept-request'>
          <Icon className={classes.check}>check</Icon>
        </IconButton>}
      </div>
      }
    </div>
  );
};

const useStyles = makeStyles({
  item: {
    position: 'relative',
    minHeight: '72px'
  },
  actions: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  clear: {
    color: 'red'
  },
  check: {
    color: 'green'
  },
  dot: {
    '& .MuiBadge-badge': {
      background: '#5dda4e',
      color: 'white',
    },
    '& .MuiBadge-dot': {
      border: '1px solid white',
      borderRadius: '50%',
      height: '14px',
      width: '14px',
      margin: '5px',
    },
  },
  badge: {
    '& .MuiBadge-badge': {
      background: '#317529',
      color: 'white',
      fontSize: '0.5rem',
      border: '1px solid white',
      margin: '2px',
    }
  }
});

export default RequestListItem;