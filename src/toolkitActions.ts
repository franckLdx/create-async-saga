import { createAction, SerializedError } from "@reduxjs/toolkit";

export function createAsyncSagaActions<Returned = void, SagaArg = void>(typePrefix: string) {
  const meta = (arg: SagaArg) => ({ meta: { arg: arg } });
  return {
    action: createAction<SagaArg>(typePrefix),
    pending: createAction(`${typePrefix}/pending`, (arg: SagaArg) => ({
      payload: undefined,
      ...meta(arg)
    })),
    fulfilled: createAction(`${typePrefix}/fulfilled`, (arg: SagaArg, result: Returned) => ({
      payload: result,
      ...meta(arg)
    })),
    rejected: createAction(`${typePrefix}/rejected`, (arg: SagaArg, error: SerializedError) => ({
      payload: error,
      ...meta(arg)
    })),
  }
};

