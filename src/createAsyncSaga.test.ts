import { createAsyncSaga } from './createAsyncSaga';
import { testSaga } from 'redux-saga-test-plan';
import { SerializedError } from '@reduxjs/toolkit';

describe('createAsyncSaga', () => {
  describe('lifecycle', () => {
    it('Should execute sucessful liefecycle', () => {
      const typePrefix = "SagaAfrica";
      const message = 'hello world';
      const asyncSaga = createAsyncSaga(typePrefix, function* () { return message });
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined })
        .next()
        .put({
          type: `${typePrefix}/pending`,
          payload: undefined,
          meta: { arg: undefined }
        })
        .next()
        .put({
          type: `${typePrefix}/fulfilled`,
          payload: message,
          meta: { arg: undefined }
        })
        .next()
        .isDone();
    });

    it('Should execute failed liefecycle', () => {
      const typePrefix = "SagaAfrica";
      const error = new Error("BOOM");
      const serializedError: SerializedError = {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
      const asyncSaga = createAsyncSaga(typePrefix, function* () { throw error; });
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined })
        .next()
        .put({
          type: `${typePrefix}/pending`,
          payload: undefined,
          meta: { arg: undefined }
        })
        .next()
        .put({
          type: `${typePrefix}/rejected`,
          payload: serializedError,
          meta: { arg: undefined }
        })
        .next()
        .isDone();
    });
  });
  describe('condition', () => {
    const typePrefix = "SagaAfrica";
    const message = 'hello world';
    function* doMessage() { return message };

    it('should execute saga', () => {
      const asyncSaga = createAsyncSaga(
        typePrefix,
        doMessage,
        { condition: function* () { return true } }
      );
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined })
        .next()
        .put({
          type: `${typePrefix}/pending`,
          payload: undefined,
          meta: { arg: undefined }
        })
        .next()
        .put({
          type: `${typePrefix}/fulfilled`,
          payload: message,
          meta: { arg: undefined }
        })
        .next()
        .isDone();
    });
    it('should not execute saga', () => {
      const asyncSaga = createAsyncSaga(
        typePrefix,
        doMessage,
        { condition: function* () { return false } }
      );
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined })
        .next()
        .isDone();
    });
  });
});