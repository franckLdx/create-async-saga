import { createAsyncSagaActions } from "./toolkitActions";
import { put } from "redux-saga/effects";

interface CreateAsyncSagaProps<ARG, RESULT> {
  name: string;
  generator: (arg: ARG) => Generator<any, RESULT, any>;
  condition?: (arg: ARG) => any;
}

export const createAsyncSaga = <ARG = void, RESULT = void>({ name, generator, condition }: CreateAsyncSagaProps<ARG, RESULT>) => {
  const actions = createAsyncSagaActions<ARG, RESULT>(name);
  type TriggerAction = ReturnType<typeof actions.action>;

  const asyncSaga = function* ({ payload }: TriggerAction) {
    const execute = condition ? yield* condition(payload) : true;
    if (!execute) {
      return;
    }
    yield put(actions.pending(payload));
    try {
      const gen = generator(payload);
      let next = gen.next();
      while (!next.done) {
        const tmp: unknown = yield next.value;
        next = gen.next(tmp);
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

};
