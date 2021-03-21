# create-async-saga
For those that use both [redux-toolkit](https://redux-toolkit.js.org/) and [redux-saga](https://redux-saga.js.org/), it is like createAsyncThunk, but using generator instead of asynchronous callback.

createAsyncSaga accepts a Redux action type string and generator function. It generates lifecycle action types based on the action type prefix that you pass in, and returns an object:

```javascript
{
  asyncSaga,  // a saga that will run the generator and dispatch the lifecycle actions.
  action,     // an action creator, creates the action to dispatch for executing the saga
  actionType, // the action's type
  pending, fulfilled, rejected // actions creator for lifecycle actions
}
```

The created saga has to be executed using the created action:
```javascript
export function* watchUsersRequired() {
  yield takeEvery(fetchUser.actionType, fetchUser.asyncSaga);
}
```

Like createAsyncThunk, it does not generate any reducer functions. You should write your own reducer logic that handles these actions:

```javascript
const fetchUser = createAsyncSaga(
  'users/fetch',
  function* (userId: string) {
    const user = yield call(fetchUser, userId);
    return user;
  }
);

createSlice({
  name: ...,
  initialState: { ... },
  reducers: { ... },
  extraReducers(builder) {
    builder.addCase(
      fetchUser.pending,
      (state) => { 
        state.fetchStatus = "pending"; 
      }
    );
    builder.addCase(
      fetchUser.fulfilled,
      (state, action) => {
        state.fetchStatus = "fulfilled";
        state.user = action.payload;
      }
    );
    builder.addCase(
      fetchUser.rejected,
      (state) => {
        state.fetchStatus = "rejected"; 
      }
    );
  }
});
```


---
## API
```javascript
function createAsyncSaga<Returned, Arg>(typePrefix: string, payloadCreator: PayloadCreator<Returned, Arg>, options?: AsyncSagaOptions<Arg>)

type PayloadCreator<Returned, Arg> = (arg: Arg) => Generator<any, Returned, any>;

type Condition<Arg> = (arg: Arg) => Generator<any, boolean, any>;
```
`Returned` is the return type of the playlod generator and `Arg` is the arguments type of the payload generator.
* `typePrefix`: prefix for generated Redux action type constants.

    When `typePrefix` is `users/fetch` actions types are `users/fetch`, `users/fetch/pending`, `users/fetch/fulfilled` and `users/fetch/rejected`

* `payloadCreator`: a generator that __*returns*__ the payload to be put in `fulfilled` action. It can __*yield*__ any effects it needs.
    ```javascript
      function* (userId: string) {
        const user: User = yield call(fetchUser, userId); // yield an effect
        return user; // returns the result
      },
    ```
    A `payloadCreator` can receive an arg. If you need to pass in multiple values, pass them together in an object when you dispatch the action.

 * `options`: an object with (currently) one optional field (mode fiemd will be added in the coming releases):
    * condition?: Condition<Arg>: a generator that can be used to skip execution of the payload creator. It can __*yield*__ any effects but it __*returns*__ a boolean.
---
## Testing
One can test the payload generator only or the saga returned by createAsyncSaga, although the full saga requires more stuff. In both case, test can be written using any Saga [tests receipes](https://redux-saga.js.org/docs/advanced/Testing).

A generator payload test (using [redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan):
```javascript
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
```

A full saga test (still using [redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan):
```javascript
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
```

---
## Known limitations & issues
This lib is new, and is missing some advanced functionalities (they will be added in the coming releases):
  * dispatchConditionRejection is missing in options
  * requestId is missing in meta
  * error may not be a real SerializedError
  