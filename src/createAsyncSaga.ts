import { createAsyncSagaActions } from "./tools/actions";
import { put } from "redux-saga/effects";
import { ConditionError, toSerializedError } from "./tools/error";

export function createAsyncSaga<Returned, Arg>(typePrefix: string, payloadCreator: PayloadCreator<Returned, Arg>, options?: AsyncSagaOptions<Arg>) {
  const { action, pending, fulfilled, rejected } = createAsyncSagaActions<Returned, Arg>(typePrefix);
  type TriggerAction = ReturnType<typeof action>;
  const canExecute = canExecuteHof(options?.condition);

  const asyncSaga = function* ({ payload, meta }: TriggerAction) {
    const requestId = meta.requestId;
    const execute = yield* canExecute(payload);
    if (!execute) {
      if (options?.dispatchConditionRejection) {
        yield put(rejected(payload, requestId, new ConditionError()));
      }
      return;
    }

    yield put(pending(payload, meta.requestId));
    try {
      const result = yield* payloadCreator(payload);
      yield put(fulfilled(payload, requestId, result));
    } catch (err) {
      const serializedError = toSerializedError(err, typePrefix);
      yield put(rejected(payload, requestId, serializedError));
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
  dispatchConditionRejection?: boolean,
}

function canExecuteHof<Arg>(condition?: Condition<Arg>): Condition<Arg> {
  return function* (arg: Arg) {
    return condition !== undefined ? yield* condition(arg) : true;
  }
}
