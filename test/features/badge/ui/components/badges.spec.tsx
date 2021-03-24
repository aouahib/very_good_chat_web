import React from 'react';
import {fireEvent, render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../../src/store/store";
import {anything, instance, mock, reset, verify, when} from "ts-mockito";
import {badgeActions} from "../../../../../src/features/badge/badge-slice";
import {BadgeActionsContext} from "../../../../../src/features/badge/badge-actions-context";
import Badges from "../../../../../src/features/badge/ui/components/badges";
import {FriendsState} from "../../../../../src/features/friend/friends-slice";
import {FriendRequest} from "../../../../../src/features/friend/types/friend-request";
import {getMockStore, mockUser} from "../../../../mock-objects";
import {BadgeName} from "../../../../../src/features/badge/types/badge";
import {MemoryRouter} from "react-router-dom";

const MockBadgeActions = mock<typeof badgeActions>();
const MockStore = getMockStore();
const action = {type: 'update'} as any;

const renderIt = (store: AppStore) => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']} initialIndex={0}>
        <BadgeActionsContext.Provider value={instance(MockBadgeActions)}>
          <Badges/>
        </BadgeActionsContext.Provider>
      </MemoryRouter>
    </Provider>
  );
};

const present = new Date();
const past = new Date(present.getTime() - 10000);
const future = new Date(present.getTime() + 10000);

beforeEach(() => {
  reset(MockBadgeActions);
  when(MockBadgeActions.updateBadge(anything())).thenReturn(action);
});

describe('Requests badge', function () {
  const req1: FriendRequest = {
    user: {...mockUser, id: '1', username: '1'},
    date: future
  };
  const req2: FriendRequest = {
    user: {...mockUser, id: '2', username: '2'},
    date: future
  };
  const req3: FriendRequest = {
    user: {...mockUser, id: '3', username: '3'},
    date: past
  };
  const req4: FriendRequest = {
    user: {...mockUser, id: '4', username: '4'},
    date: past
  };
  it('should display the right number in the badge, ' +
    'and clicking on button should update the badge',
    async () => {
      // arrange
      const state = {
        badge: {
          friendRequests: present,
          notifications: present
        },
        friends: {
          friendRequests: {
            sent: [],
            // 2 requests in the past, 2 in the future
            received: [req1, req2, req3, req4],
          },
          error: null,
          beingTreated: []
        } as FriendsState
      } as AppState;
      const mockStore = MockStore(state);
      // render
      renderIt(mockStore);
      // assert
      // should display the number of requests in the future (2)
      expect(await screen.findByText('2')).toBeInTheDocument();
      // should dispatch an update action on click
      const button = screen.getByTestId('friend-requests-button');
      fireEvent.click(button);
      verify(MockBadgeActions.updateBadge(BadgeName.FRIEND_REQUESTS)).once();
      expect(mockStore.getActions()).toHaveLength(1);
      expect(mockStore.getActions()[0]).toBe(action);
    },
  );
});