import { createAction, nanoid, PrepareAction, SerializedError } from "@reduxjs/toolkit";
import { ConditionError } from "./error";

export interface Meta<Arg> {
  arg: Arg,
  requestId: string;
}

export function createAsyncSagaActions<Returned = void, Arg = void>(typePrefix: string) {
  const getStdMeta = (arg: Arg, requestId: string): { meta: Meta<Arg> } => ({ meta: { arg, requestId } });

  return {
    action: createAction(typePrefix, (arg: Arg) => ({
      payload: arg,
      meta: {
        requestId: nanoid()
      }
    })),
    pending: createAction(`${typePrefix}/pending`, (arg: Arg, requestId: string) => ({
      payload: undefined,
      ...getStdMeta(arg, requestId)
    })),
    fulfilled: createAction<PrepareAction<Returned>>(`${typePrefix}/fulfilled`, (arg: Arg, requestId: string, result: Returned) => ({
      payload: result,
      ...getStdMeta(arg, requestId)
    })),
    rejected: createAction(`${typePrefix}/rejected`, (arg: Arg, requestId: string, error: SerializedError) => {
      const metaData = getStdMeta(arg, requestId);
      const rejectedMetaData = {
        ...metaData,
        meta: {
          ...metaData.meta,
          condition: error instanceof ConditionError,
        }
      }
      return {
        payload: error,
        ...rejectedMetaData
      }
    }),
  }
};

