import { SerializedError } from "@reduxjs/toolkit";
import { toSerializedError } from "./error";

describe('Convert an error to a serialzed error', () => {
  it('Convert an error', () => {
    const error = new Error("Boom Big badaboum");
    const expectedSerializedError: SerializedError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    const actualSerializedError = toSerializedError(error, 'a test');
    expect(actualSerializedError).toStrictEqual(expectedSerializedError);
  });

  it('Convert an object with no message', () => {
    const typePrefix = 'fooBar';
    const expectedSerializedError: SerializedError = {
      message: `Unexpected error while execution a payload genetator for ${typePrefix}`,
    };
    const actualSerializedError = toSerializedError({}, typePrefix);
    expect(actualSerializedError).toStrictEqual(expectedSerializedError);
  })

  it('Convert a string', () => {
    const typePrefix = 'fooBar';
    const message = "BOOM";
    const expectedSerializedError: SerializedError = {
      message,
    };
    const actualSerializedError = toSerializedError(message, typePrefix);
    expect(actualSerializedError).toStrictEqual(expectedSerializedError);
  })

  it('Should work with a null error', () => {
    const typePrefix = 'fooBar';
    const expectedSerializedError: SerializedError = {
      message: `Unexpected error while execution a payload genetator for ${typePrefix}`,
    };
    const actualSerializedError = toSerializedError(null, typePrefix);
    expect(actualSerializedError).toStrictEqual(expectedSerializedError);
  })
});