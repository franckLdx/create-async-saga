# create-async-saga
Like createAsyncThunk, but for saga.

createAsyncSaga accepts a Redux action type string and generator function. It generates lifecycle action types based on the action type prefix that you pass in, and returns an object:

```javascript
{
  asyncSaga,  // a saga action creator that will run the generator and dispatch the lifecycle actions based on the returned generator.
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
  function* () {
    ...
  }
);

createSlice({
  name: ...,
  initialState: { ... },
  reducers: { ... },
  extraReducers(builder) {
    builder.addCase(
      fetchUser.pending,
      (state) => { state.fetchStatus = "pending"; }
    );
    builder.addCase(
      fetchUser.fulfilled,
      (state, action) => {
        state.fetchStatus = "fulfilled";
        state.users = action.payload;
      }
    );
    builder.addCase(
      fetchUser.rejected,
      (state) => { state.fetchStatus = "rejected"; }
    );
  }
});
```


---
## API
```javascript
function createAsyncSaga<Returned, Arg>(typePrefix: string, payloadCreator: PayloadCreator<Returned, Arg>, options?: AsyncSagaOptions<Arg>)
```
`Returned` is the return type of the playlod generator and `Arg` is the arguments type of the payload generator.
* `typePrefix`: prefix for generated Redux action type constants.

    When `typePrefix` is `users/fetch` actions types are `users/fetch`, `users/fetch/pending`, `users/fetch/fulfilled` and `users/fetch/rejected`

* `payloadCreator`: a generator that __returns__ the result of the saga. The saga can __yield__ any effects it needs.
```javascript
  function* (userId: string) {
    const users: User = yield call(fetchUser, userId); // yield an effect
    return users; // returns the result
  },
```
A `payloadCreator` can receive an arg. If you need to pass in multiple values, pass them together in an object when you dispatch the action.

 * `options`: an object with (currently) one optional field:
    * condition?: Condition<Arg>: a generator that can be used to skip execution of the payload creator. It can __yield__ any effects and returns boolean.
    
---
## Known limitations/issues
This lib is new, and is missing some advanced functionalities (they will be added in the coming releases):
  * dispatchConditionRejection is missing in options
  * requestId is missing in meta
  * error may not be a real SerializedError
  