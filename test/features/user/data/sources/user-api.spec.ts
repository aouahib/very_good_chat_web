import {deepEqual, instance, mock, verify, when} from "ts-mockito";
import {ApolloClient, ApolloQueryResult} from "@apollo/client";
import {
  IUserAPI,
  UserAPI
} from "../../../../../src/features/user/data/sources/user-api";
import {describe} from "@jest/globals";
import {
  RegisterMutation,
  RegisterMutationVariables
} from "../../../../../src/_generated/RegisterMutation";
import {
  ME_QUERY,
  REGISTER_MUTATION,
  USERNAME_EXISTENCE_QUERY
} from "../../../../../src/features/user/data/graphql";
import {mockUser, mockUserCreation} from "../../../../mock-objects";
import {MeQuery} from "../../../../../src/_generated/MeQuery";
import {
  UsernameExistenceQuery,
  UsernameExistenceQueryVariables
} from "../../../../../src/_generated/UsernameExistenceQuery";

const MockApolloClient = mock<ApolloClient<any>>();
const userAPI: IUserAPI = new UserAPI(instance(MockApolloClient));

describe('createUser', () => {
  it('should return the created user on success', async () => {
    // arrange
    const registerInput = mockUserCreation;
    when(MockApolloClient.mutate<RegisterMutation, RegisterMutationVariables>(
      deepEqual({
        mutation: REGISTER_MUTATION,
        variables: {registerInput},
      }))).thenResolve({
      data: {
        register: {
          __typename: "User",
          ...mockUser
        }
      }
    });
    // act
    const result = await userAPI.createUser(mockUserCreation);
    // assert
    expect(result).toStrictEqual(mockUser);
    verify(MockApolloClient.mutate(deepEqual(
      {mutation: REGISTER_MUTATION, variables: {registerInput}}
    ))).once();
  });
});

describe('getCurrentUser', () => {
  it('should return the current user', async () => {
    // arrange
    when(MockApolloClient.query<MeQuery>(deepEqual({query: ME_QUERY})))
      .thenResolve({
        data: {
          me: {
            __typename: "User",
            ...mockUser
          }
        }
      } as ApolloQueryResult<MeQuery>);
    // act
    const result = await userAPI.getCurrentUser();
    // assert
    expect(result).toStrictEqual(mockUser);
    verify(MockApolloClient.query(deepEqual({query: ME_QUERY}))).once();
  });
});

describe('isUsernameTaken', () => {
  it('should return a the username existence status', async () => {
    // arrange
    const username = 'weird_username';
    when(MockApolloClient.query
      < UsernameExistenceQuery, UsernameExistenceQueryVariables >
      (deepEqual({
        query: USERNAME_EXISTENCE_QUERY,
        variables: {username}
      }))
    ).thenResolve({
      data: {checkUsernameExistence: true}
    } as ApolloQueryResult<UsernameExistenceQuery>);
    // act
    const result = await userAPI.isUsernameTaken(username);
    // assert
    expect(result).toStrictEqual(true);
    verify(MockApolloClient.query(
      deepEqual({query: USERNAME_EXISTENCE_QUERY, variables: {username}}))
    ).once();
  });
});