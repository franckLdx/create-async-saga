import { createAction, nanoid, SerializedError } from "@reduxjs/toolkit";

export interface Meta<Arg> {
  arg: Arg,
  requestId: string;
}

export function createAsyncSagaActions<Returned = void, Arg = void>(typePrefix: string) {
  const meta = (arg: Arg, requestId: string): { meta: Meta<Arg> } => ({ meta: { arg, requestId } });

  return {
    action: createAction(typePrefix, (arg: Arg) => ({
      payload: arg,
      meta: {
        requestId: nanoid()
      }
    })),
    pending: createAction(`${typePrefix}/pending`, (arg: Arg, requestId: string) => ({
      payload: undefined,
      ...meta(arg, requestId)
    })),
    fulfilled: createAction(`${typePrefix}/fulfilled`, (arg: Arg, requestId: string, result: Returned) => ({
      payload: result,
      ...meta(arg, requestId)
    })),
    rejected: createAction(`${typePrefix}/rejected`, (arg: Arg, requestId: string, error: SerializedError) => ({
      payload: error,
      ...meta(arg, requestId)
    })),
  }
};

