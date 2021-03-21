import { testSaga } from "redux-saga-test-plan";
import { call } from "redux-saga/effects";
import { createAsyncSaga } from "../src/createAsyncSaga";

interface User {
  id: string,
  name: string,
}

function* fetchUser(userId: string): Generator<any, User, any> {
  const user: User = yield call(fetchUser, userId);
  return user;
}

it('Test payload generator', () => {
  const user: User = {
    id: '123',
    name: "John doe",
  };
  testSaga(fetchUser, user.id)
    .next()
    .call(fetchUser, user.id)
    .next(user)
    .returns(user);
});

const fetchUserSaga = createAsyncSaga(
  'users/fetch',
  fetchUser
);

it('Test full saga', () => {
  const user: User = {
    id: '123',
    name: "John doe",
  };
  const action = fetchUserSaga.action(user.id);
  testSaga(fetchUserSaga.asyncSaga, action)
    .next()
    .put(fetchUserSaga.pending(user.id))
    .next()
    .call(fetchUser, user.id)
    .next(user)
    .put(fetchUserSaga.fulfilled(user.id, user))
    .next()
    .isDone();
});

