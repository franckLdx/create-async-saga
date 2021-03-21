import { createAsyncSagaActions } from "./toolkitActions";
import { put } from "redux-saga/effects";

export function createAsyncSaga<Returned, Arg>(typePrefix: string, payloadCreator: PayloadCreator<Returned, Arg>, options?: AsyncSagaOptions<Arg>) {
  const { action, pending, fulfilled, rejected } = createAsyncSagaActions<Returned, Arg>(typePrefix);
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

type PayloadCreator<Returned, Arg> = (arg: Arg) => Generator<any, Returned, any>;

type Condition<Arg> = (arg: Arg) => Generator<any, boolean, any>;

interface AsyncSagaOptions<Arg> {
  condition?: Condition<Arg>,
}
