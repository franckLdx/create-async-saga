import { SerializedError } from "@reduxjs/toolkit"

type SerializedErrorField = keyof SerializedError;
const serializedErrorFields: SerializedErrorField[] = ['name', 'code', 'stack', 'message'];

const setField = (field: SerializedErrorField, serializedError: SerializedError, error: any) => {
  const value = error[field];
  if (value !== undefined && typeof value === "string") {
    serializedError[field] = value;
  }
}

export const toSerializedError = (error: any, typePrefix: string): SerializedError => {
  const serializedError: SerializedError = {};
  serializedError.message = `Unexpected error while execution a payload genetator for ${typePrefix}`;

  if (error !== null && error !== undefined) {
    if (typeof error === 'object') {
      serializedErrorFields.forEach(
        field => setField(field, serializedError, error)
      );
    } else {
      serializedError.message = String(error);
    }
  }

  return serializedError;
};