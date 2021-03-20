import { createAction, SerializedError } from "@reduxjs/toolkit";

export const createAsyncSagaActions = <ARG = void, RESULT = void>(name: string) => {
  const meta = (arg: ARG) => ({ meta: { arg: arg } });
  return {
    action: createAction<ARG>(name),
    pending: createAction(`${name}/pending`, (arg: ARG) => ({
      payload: undefined,
      ...meta(arg)
    })),
    fulfilled: createAction(`${name}/fulfilled`, (arg: ARG, result: RESULT) => ({
      payload: result,
      ...meta(arg)
    })),
    rejected: createAction(`${name}/rejected`, (arg: ARG, error: SerializedError) => ({
      payload: error,
      ...meta(arg)
    })),
  }
};

