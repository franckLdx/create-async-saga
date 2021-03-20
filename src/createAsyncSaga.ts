import { createAsyncSagaActions } from "./toolkitActions";
import { put } from "redux-saga/effects";

interface AsyncSagaOptions<SagaArg> {
  condition?: (arg: SagaArg) => Generator<any, boolean, any>
}

export function createAsyncSaga<Returned, SagaArg>(typePrefix: string, payloadCreator: (arg: SagaArg) => Generator<any, Returned, any>, options?: AsyncSagaOptions<SagaArg>) {
  const { action, pending, fulfilled, rejected } = createAsyncSagaActions<Returned, SagaArg>(typePrefix);
  type TriggerAction = ReturnType<typeof action>;

  const asyncSaga = function* ({ payload }: TriggerAction) {
    const execute = options?.condition ? yield* options?.condition(payload) : true;
    if (!execute) {
      return;
    }
    yield put(pending(payload));
    try {
      const payloadGenerator = payloadCreator(payload);
      let next = payloadGenerator.next();
      while (!next.done) {
        const tmp: unknown = yield next.value;
        next = payloadGenerator.next(tmp);
      }
      const result = next.value;
      yield put(fulfilled(payload, result));
    } catch (err) {
      yield put(rejected(payload, err));
    }
  }

  return {
    actionType: action.type,
    action, pending, fulfilled, rejected,
    asyncSaga,
  };

}
