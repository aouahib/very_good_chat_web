import React from 'react';
import {getMockStore, loggedInAuthState, mockMe,} from "../../../mock-objects";
import {render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../src/store/store";
import LoggedInScreen from "../../../../src/features/user/ui/logged-in-screen";
import {UserActionsContext} from "../../../../src/features/user/user-actions-context";
import {MeState, userActions} from "../../../../src/features/user/me-slice";
import UserError from "../../../../src/features/user/types/user-error";
import {MemoryRouter} from "react-router-dom";
import {initialSearchState} from "../../../../src/features/search/search-slice";
import {
  badgeActions,
  initialBadgeState
} from "../../../../src/features/badge/badge-slice";
import {
  friendsActions,
  initialFriendsState
} from "../../../../src/features/friend/friends-slice";
import {
  initialNotificationState,
  notificationActions
} from "../../../../src/features/notification/notification-slice";
import {instance, mock, resetCalls, verify, when} from "ts-mockito";
import {FriendsActionsContext} from "../../../../src/features/friend/friends-actions-context";
import {NotificationActionsContext} from '../../../../src/features/notification/notification-actions-context';
import {BadgeActionsContext} from '../../../../src/features/badge/badge-actions-context';

const MockUserActions = mock<typeof userActions>();
const MockFriendActions = mock<typeof friendsActions>();
const MockNotificationActions = mock<typeof notificationActions>();
const MockBadgeActions = mock<typeof badgeActions>();

const MockStore = getMockStore();
const meAction = {type: 'me'} as any;
const getFriendsAction = {type: 'friends'} as any;
const getFriendsReqsAction = {type: 'friend reqs'} as any;
const getNotificationsAction = {type: 'notification'} as any;
const getBadgesAction = {type: 'badges'} as any;

const initialMeState: MeState = {
  initialized: false,
  me: null,
  updatingUser: false,
  error: null,
};
const initialState = {
  me: initialMeState,
  auth: loggedInAuthState,
  search: initialSearchState,
  badge: initialBadgeState,
  notification: initialNotificationState
} as AppState;

const renderComponent = (mockStore: AppStore, path: string = '/') => {
  render(
    <Provider store={mockStore}>
      <UserActionsContext.Provider value={instance(MockUserActions)}>
        <FriendsActionsContext.Provider value={instance(MockFriendActions)}>
          <NotificationActionsContext.Provider
            value={instance(MockNotificationActions)}>
            <BadgeActionsContext.Provider value={instance(MockBadgeActions)}>
              <MemoryRouter initialEntries={[path]} initialIndex={0}>
                <LoggedInScreen/>
              </MemoryRouter>
            </BadgeActionsContext.Provider>
          </NotificationActionsContext.Provider>
        </FriendsActionsContext.Provider>
      </UserActionsContext.Provider>
    </Provider>
  );
};

beforeAll(() => {
  when(MockUserActions.getMe()).thenReturn(meAction);
  when(MockFriendActions.getFriends()).thenReturn(getFriendsAction);
  when(MockFriendActions.getFriendRequests()).thenReturn(getFriendsReqsAction);
  when(MockNotificationActions.getNotifications()).thenReturn(getNotificationsAction);
  when(MockBadgeActions.getBadges()).thenReturn(getBadgesAction);
});

beforeEach(() => {
  resetCalls(MockUserActions);
});

test('Should dispatch all required actions on render', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  verify(MockUserActions.getMe()).once();
  verify(MockFriendActions.getFriendRequests()).once();
  verify(MockFriendActions.getFriends()).once();
  verify(MockNotificationActions.getNotifications()).once();
  verify(MockBadgeActions.getBadges()).once();
  const actions = mockStore.getActions();
  expect(actions).toHaveLength(5);
  expect(actions[0]).toBe(meAction);
  expect(actions[1]).toBe(getFriendsReqsAction);
  expect(actions[2]).toBe(getFriendsAction);
  expect(actions[3]).toBe(getNotificationsAction);
  expect(actions[4]).toBe(getBadgesAction);
});

test('Should display a loader if the state is being initialized', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('fullscreen-loader')).toBeInTheDocument();
  expect(screen.queryByTestId('retry-button')).toBeNull();
  expect(screen.queryByTestId('profile-updating-screen')).toBeNull();
  expect(screen.queryByTestId('main-screen')).toBeNull();
});

test('Should display a retry button if there was an initialization error', () => {
  // arrange
  const errorState: AppState = {
    ...initialState,
    me: {...initialMeState, error: UserError.network},
  };
  const mockStore = MockStore(errorState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
  expect(screen.queryByTestId('profile-updating-screen')).toBeNull();
  expect(screen.queryByTestId('main-screen')).toBeNull();
});

test(
  'Should display the registration screen if the state was initialized, ' +
  'but no user was logged in',
  () => {
    // arrange
    const registrationState: AppState = {
      ...initialState,
      me: {...initialMeState, initialized: true},
    };
    const mockStore = MockStore(registrationState);
    // act
    renderComponent(mockStore);
    // assert
    expect(screen.getByTestId('profile-updating-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('main-screen')).toBeNull();
    expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
    expect(screen.queryByTestId('retry-button')).toBeNull();
  },
);

describe('When the state is initialized and a user is logged in', () => {
  const loggedInState: AppState = {
    ...initialState,
    me: {...initialMeState, initialized: true, me: mockMe},
    badge: initialBadgeState,
    friends: initialFriendsState
  };
  const mockTheStore = () => MockStore(loggedInState);

  test(
    'Should display the main screen if the path is "/"',
    () => {
      // arrange
      const mockStore = mockTheStore();
      // act
      renderComponent(mockStore);
      // assert
      expect(screen.getByTestId('main-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-updating-screen')).toBeNull();
      expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
      expect(screen.queryByTestId('retry-button')).toBeNull();
    },
  );
  test(
    'Should display the profile screen if the path is "/profile"',
    () => {
      // arrange
      const mockStore = mockTheStore();
      // act
      renderComponent(mockStore, '/profile');
      // assert
      expect(screen.getByTestId('profile-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('main-screen')).toBeNull();
      expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
      expect(screen.queryByTestId('retry-button')).toBeNull();
    },
  );

  test(
    'Should display the profile updating screen if the path is "/edit-profile"',
    () => {
      // arrange
      const mockStore = mockTheStore();
      // act
      renderComponent(mockStore, '/edit-profile');
      // assert
      expect(screen.getByTestId('profile-updating-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('main-screen')).toBeNull();
      expect(screen.queryByTestId('fullscreen-loader')).toBeNull();
      expect(screen.queryByTestId('retry-button')).toBeNull();
    },
  );
});
