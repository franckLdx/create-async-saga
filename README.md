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
export function* watchPostsRequired() {
  yield takeEvery(fetchUser.actionType, fetchUser.asyncSaga);
}
```

Like createAsyncThunk, it does not generate any reducer functions. You should write your own reducer logic that handles these actions:

```javascript
const fetchUser = createAsyncSaga(
  'fetchUser',
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
        state.posts = action.payload;
      }
    );
    builder.addCase(
      fetchUser.rejected,
      (state) => { state.fetchStatus = "rejected"; }
    );
  }
});
```

## Todo
This lib is new, and is missing some advanced functionalities (they will be added in the coming releases):
  * dispatchConditionRejection is missing in options
  * requestId s missing in meta
  * error may not be a real SerializedError
  