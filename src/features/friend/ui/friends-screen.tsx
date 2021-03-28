import React, {useCallback, useEffect} from "react";
import {makeStyles, Typography} from "@material-ui/core";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {PulseLoader} from "react-spinners";
import RetryButton from "../../user/ui/components/retry-button";
import {useFriendsActions} from "../friends-actions-context";
import TopBar, {useTopBarStyles} from "../../user/ui/components/top-bar";
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList} from "react-window";
import RequestListItem from "./components/request-list-item";
import User from "../../user/types/user";
import {useHistory} from "react-router-dom";
import {stringifyFriendError} from "../types/friend-error";
import {FriendRequest} from "../types/friend-request";

const FriendsScreen = () => {
  const state = useAppSelector(state => state.friends);
  const dispatch = useAppDispatch();
  const actions = useFriendsActions();
  const history = useHistory();
  const classes = useStyles();
  const topBarClasses = useTopBarStyles();

  useEffect(() => {
    dispatch(actions.getFriends());
  }, []);

  const goToUserProfile = useCallback((user: User) => {
    history.push(`/u/${user.username}`);
  }, [history]);

  const retry = useCallback(() => {
    dispatch(actions.getFriends());
  }, []);

  const itemKey = useCallback((index: number, data: FriendRequest[]) => {
    return data[index].user.username;
  }, [state.friendRequests]);

  let child: React.ReactNode;
  if (state.friends) {
    const friends = state.friends;
    if (friends.length) {
      child = <AutoSizer>
        {({height, width}) => {
          return <FixedSizeList
            itemCount={friends.length}
            itemData={friends}
            itemKey={itemKey}
            height={height}
            width={width}
            itemSize={72}
          >
            {({index, style, data}) => {
              return (
                <RequestListItem
                  style={style}
                  req={data[index]}
                  onClick={goToUserProfile}
                  confirmed={true}
                />
              );
            }}
          </FixedSizeList>;
        }}
      </AutoSizer>;
    } else {
      child = (
        <div className={classes.centered} data-testid='no-friends'>
          <span>You have no friends :(</span>
        </div>
      );
    }
  } else if (state.friendsError != null) {
    child = (
      <div className={classes.centered}>
        <RetryButton
          onClick={retry}
          message={stringifyFriendError(state.friendsError)}
        />
      </div>
    );
  } else {
    child = (
      <div className={classes.centered} data-testid='friends-loading'>
        <PulseLoader/>
      </div>
    );
  }
  return (
    <div className={classes.outer}>
      <TopBar>
        <Typography variant='h6' className={topBarClasses.title}>
          Friends
        </Typography>
      </TopBar>
      {child}
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '56px',
  },
  centered: {
    margin: 'auto',
  },
});

export default FriendsScreen;