import { createAsyncSagaActions } from "./toolkitActions";
import { put } from "redux-saga/effects";

interface AsyncSagaOptions<SagaArg> {
  condition?: (arg: SagaArg) => Generator<any, boolean, any>
}

export function createAsyncSaga<Returned, SagaArg>(typePrefix: string, payloadCreator: (arg: SagaArg) => Generator<any, Returned, any>, options?: AsyncSagaOptions<SagaArg>) {
  const actions = createAsyncSagaActions<Returned, SagaArg>(typePrefix);
  type TriggerAction = ReturnType<typeof actions.action>;

  const asyncSaga = function* ({ payload }: TriggerAction) {
    const execute = options?.condition ? yield* options?.condition(payload) : true;
    if (!execute) {
      return;
    }
    yield put(actions.pending(payload));
    try {
      const payloadGenerator = payloadCreator(payload);
      let next = payloadGenerator.next();
      while (!next.done) {
        const tmp: unknown = yield next.value;
        next = payloadGenerator.next(tmp);
      }
      const result = next.value;
      yield put(actions.fulfilled(payload, result));
    } catch (err) {
      yield put(actions.rejected(payload, err));
    }
  }

  return {
    ...actions, asyncSaga
  }

}
