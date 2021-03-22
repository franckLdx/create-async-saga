import { createAsyncSagaActions } from "./tools/toolkitActions";
import { put } from "redux-saga/effects";
import { errToSerializedError } from "./tools/error";

export function createAsyncSaga<Returned, Arg>(typePrefix: string, payloadCreator: PayloadCreator<Returned, Arg>, options?: AsyncSagaOptions<Arg>) {
  const { action, pending, fulfilled, rejected } = createAsyncSagaActions<Returned, Arg>(typePrefix);
  type TriggerAction = ReturnType<typeof action>;
  const canExecute = canExecuteHof(options?.condition);
  const asyncSaga = function* ({ payload }: TriggerAction) {
    const execute = yield* canExecute(payload);
    if (!execute) {
      return;
    }
    yield put(pending(payload));
    try {
      const result = yield* payloadCreator(payload);
      yield put(fulfilled(payload, result));
    } catch (err) {
      const serializedError = errToSerializedError(err, typePrefix);
      yield put(rejected(payload, serializedError));
    }
  }

  return {
    actionType: action.type,
    action, pending, fulfilled, rejected,
    asyncSaga,
  };

}

export type PayloadCreator<Returned, Arg> = (arg: Arg) => Generator<any, Returned, any>;

export type Condition<Arg> = (arg: Arg) => Generator<any, boolean, any>;

export interface AsyncSagaOptions<Arg> {
  condition?: Condition<Arg>,
}

function canExecuteHof<Arg>(condition?: Condition<Arg>): Condition<Arg> {
  return function* (arg: Arg) {
    return condition !== undefined ? yield* condition(arg) : true;
  }
}