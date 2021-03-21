import { createAction, SerializedError } from "@reduxjs/toolkit";

export function createAsyncSagaActions<Returned = void, Arg = void>(typePrefix: string) {
  const meta = (arg: Arg) => ({ meta: { arg: arg } });
  return {
    action: createAction<Arg>(typePrefix),
    pending: createAction(`${typePrefix}/pending`, (arg: Arg) => ({
      payload: undefined,
      ...meta(arg)
    })),
    fulfilled: createAction(`${typePrefix}/fulfilled`, (arg: Arg, result: Returned) => ({
      payload: result,
      ...meta(arg)
    })),
    rejected: createAction(`${typePrefix}/rejected`, (arg: Arg, error: SerializedError) => ({
      payload: error,
      ...meta(arg)
    })),
  }
};

