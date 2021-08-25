# create-async-saga
For those that use both [redux-toolkit](https://redux-toolkit.js.org/) and [redux-saga](https://redux-saga.js.org/), it is like createAsyncThunk, but using generator instead of asynchronous callback.

createAsyncSaga accepts a Redux action type string and generator function. It generates lifecycle action types based on the action type prefix that you pass in, and returns an object that allow to 
  * dispatch an action to trigger your function 
  * update your state using a slice 

## Getting started
!! You must have redux-toolkit & redux-saga installed and configured 

You want to load a user using an api: 

```javascript
interface User {
  userId: number,
  name: string;
}

const fetchUserApi = (userId: number): User => ({ userId, name: "foo" });
```

Call createAsyncSaga and provide a generator that call the API:
```javascript
export const fetchUser = createAsyncSaga(
  'users/fetch',
  function* (userId: number) {
    return yield call(fetchUserApi, userId)
  }
); 
```

fetchUser object contains action and it's type, the action to execute the saga. It has to be watched and dispatched 
* to watch:
```javascript
export function* watchFetchUser() {
  yield takeEvery(fetchUser.actionType, fetchUser.asyncSaga);
}
// Don't forget to add this to the saga middleware: sagaMiddleware.run(watchFetchUser) 
```
* to dispatch:
```javascript
dispatch(fetchUser.action(1))
```
* you can watch you own action:
```javascript
export function* watchFetchUser() {
  yield takeEvery(myOwnAction, fetchUser.asyncSaga);
}
```

CreateAsyncSaga dispatch a pending action when the saga start, a fulfilled action when the saga is sucessfull, and a rejected action when saga failed.
Like with createAsyncThunk, you write your own reducer logic using those actions:

```javascript
createSlice({
  name: 'user',
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
        // action.payload contains error information
      }
    );
  }
});
```


---
## API

Release 2.0.0 includes requestId in actions. This implies a modification in actions creator interface, which is a breaking change.
This impact only code that creates action by itself (which is probably test including full saga if any).

```javascript
function createAsyncSaga<Returned, Arg>(typePrefix: string, payloadCreator: PayloadCreator<Returned, Arg>, options?: AsyncSagaOptions<Arg>)

type PayloadCreator<Returned, Arg> = (arg: Arg) => Generator<any, Returned, any>;

interface AsyncSagaOptions<Arg> {
  condition?: Condition<Arg>,
  dispatchConditionRejection?: boolean,
}

type Condition<Arg> = (arg: Arg) => Generator<any, boolean, any>;
```
* `Returned` is the return type of the playlod generator and `Arg` is the arguments type of the payload creator.
* `typePrefix`: prefix for generated Redux action type constants.

    When `typePrefix` is `users/fetch` actions types are `users/fetch`, `users/fetch/pending`, `users/fetch/fulfilled` and `users/fetch/rejected`.

* `payloadCreator`: a generator that __*returns*__ the payload to be put in `fulfilled` action. It can __*yield*__ any effects it needs.
    ```javascript
      function* (userId: string) {
        const user: User = yield call(fetchUser, userId); // yield an effect
        return user; // returns the result
      },
    ```
    A `payloadCreator` can receive an arg. If you need to pass in multiple values, pass them together in an object when you dispatch the action.

* `options`: an object with the following optional fields:
    * `condition`:  a generator that can be used to skip execution of the payload creator. It can __*yield*__ any effects but it __*returns*__ a boolean. It receives arg payload creator as argument.
    * `dispatchConditionRejection`: by default if `condition` returns false, nothing is dispatched. When `dispatchConditionRejection` is set to true a "rejected" action is dispatched with meta.condition set to true.

### Actions
Actions are made of action itself, with is dispatched to trigger the async execution, and of createAsyncThunk's lifecycle actions: `pending`, `fulfilled` and `rejected`.
  * `action`:
    ```javascript
    {
      type: `typePrefix`, // the typePrefix is given to createAsyncSaga
      payload: arg, // object that contains the paylod creator arguments 
      meta: {
        requestId: string // a uniqe id generatted for each execution
      }
    }
    ```
  * `pending`:
    ```javascript
    {
      type: `typePrefix`/pending, // the typePrefix is given to createAsyncSaga
      payload: undefined, // object that contains the paylod creator arguments 
      meta: {
        arg, // object that contains the paylod creator arguments
        requestId // id generated 
      }
    }
    ```
  * `fulfilled`:
    ```javascript
    {
      type: `typePrefix`/fulfilled, // the typePrefix is given to createAsyncSaga
      payload: returned, // payload creator returned value 
      meta: {
        arg, // object that contains the paylod creator arguments
        requestId // id generated 
      }
    }
    ```
  * `rejected`:
    ```javascript
    {
      type: `typePrefix`/rejected, // the typePrefix is given to createAsyncSaga
      payload: error, // a SerializedError made from what the payload creator thrown 
      meta: {
        arg, // object that contains the paylod creator arguments
        requestId // id generated
        condition // true if rejected has been dispatched because condition has return false
      }
    }
    ```

---
## Testing
One can test the payload generator only or the saga returned by createAsyncSaga, although the full saga requires more stuff. In both case, test can be written using any Saga [tests receipes](https://redux-saga.js.org/docs/advanced/Testing).

A generator payload test (using [redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan)):
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

A full saga test (still using [redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan)):
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
  const requestId = action.meta.requestId;
  testSaga(fetchUserSaga.asyncSaga, action)
    .next()
    .put(fetchUserSaga.pending(user.id, requestId))
    .next()
    .call(fetchUser, user.id)
    .next(user)
    .put(fetchUserSaga.fulfilled(user.id, requestId, user))
    .next()
    .isDone();
});
```

---
## Known limitations & issues
This lib is new, and is missing some advanced functionalities (they will be added in the coming releases):
  * ~~dispatchConditionRejection~~ is missing in options Fixed in release 2.1.0
  * When the async saga is cancelled a rejected action with meta.aborted===true should be thrown
  * ~~requestId is missing in meta~~ Fixed in release 2.0.0
  * ~~error may not be a real SerializedError~~ Fixed in release 1.0.2
  