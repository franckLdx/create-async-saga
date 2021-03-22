import { SerializedError } from "@reduxjs/toolkit"

export const errToSerializedError = (err: any, typePrefix: string): SerializedError => {
  const serializedError: SerializedError = {
    message: err.message ?? `Unexpected error while execution a payload genetator for ${typePrefix}`,
  };
  if (err.name !== undefined) {
    serializedError.name = err.name;
  }
  if (err.code !== undefined) {
    serializedError.code = err.code;
  }
  if (err.stack !== undefined) {
    serializedError.stack = err.stack;
  }
  return serializedError;
};