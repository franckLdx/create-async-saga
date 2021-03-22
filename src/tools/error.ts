import { SerializedError } from "@reduxjs/toolkit"

const serializedErrorField = (field: keyof SerializedError, serializedError: SerializedError, error: any) => {
  const value = error[field];
  if (value !== undefined && typeof value === "string") {
    serializedError[field] = value;
  }
}

export const toSerializedError = (error: any, typePrefix: string): SerializedError => {
  const serializedError: SerializedError = {};
  serializedErrorField('name', serializedError, error);
  serializedErrorField('code', serializedError, error);
  serializedErrorField('stack', serializedError, error);
  serializedErrorField('message', serializedError, error);
  if (!serializedError.message) {
    serializedError.message = `Unexpected error while execution a payload genetator for ${typePrefix}`;
  }
  return serializedError;
};