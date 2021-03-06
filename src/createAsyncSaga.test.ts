import { createAsyncSaga } from './createAsyncSaga';
import { testSaga } from 'redux-saga-test-plan';
import { SerializedError } from '@reduxjs/toolkit';
import { ConditionError } from './tools/error';

describe('createAsyncSaga', () => {
  describe('lifecycle', () => {
    it('Should execute sucessful liefecycle', () => {
      const typePrefix = "SagaAfrica";
      const message = 'hello world';
      const asyncSaga = createAsyncSaga(typePrefix, function* () { return message });
      const requestId = "123";
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined, meta: { requestId } })
        .next()
        .put({
          type: `${typePrefix}/pending`,
          payload: undefined,
          meta: {
            arg: undefined,
            requestId
          }
        })
        .next()
        .put({
          type: `${typePrefix}/fulfilled`,
          payload: message,
          meta: {
            arg: undefined,
            requestId
          }
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
      const requestId = "123";
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined, meta: { requestId } })
        .next()
        .put({
          type: `${typePrefix}/pending`,
          payload: undefined,
          meta: {
            arg: undefined,
            requestId
          }
        })
        .next()
        .put({
          type: `${typePrefix}/rejected`,
          payload: serializedError,
          meta: {
            arg: undefined,
            requestId,
            condition: false,
          }
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
      const requestId = "123";
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined, meta: { requestId } })
        .next()
        .put({
          type: `${typePrefix}/pending`,
          payload: undefined,
          meta: {
            arg: undefined,
            requestId
          }
        })
        .next()
        .put({
          type: `${typePrefix}/fulfilled`,
          payload: message,
          meta: {
            arg: undefined,
            requestId
          }
        })
        .next()
        .isDone();
    });

    it('should not execute saga and should not dispatch rejected (dispatchConditionRejection is undefined)', () => {
      const asyncSaga = createAsyncSaga(
        typePrefix,
        doMessage,
        {
          condition: function* () { return false },
        }
      );
      const requestId = "123";
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined, meta: { requestId } })
        .next()
        .isDone();
    });

    it('should not execute saga and should not dispatch rejected (dispatchConditionRejection is false)', () => {
      const asyncSaga = createAsyncSaga(
        typePrefix,
        doMessage,
        {
          condition: function* () { return false },
          dispatchConditionRejection: false,
        }
      );
      const requestId = "123";
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined, meta: { requestId } })
        .next()
        .isDone();
    });

    it('should not execute saga and should dispatch rejected (dispatchConditionRejection is true)', () => {
      const asyncSaga = createAsyncSaga(
        typePrefix,
        doMessage,
        {
          condition: function* () { return false },
          dispatchConditionRejection: true,
        }
      );
      const requestId = "123";
      testSaga(asyncSaga.asyncSaga, { type: typePrefix, payload: undefined, meta: { requestId } })
        .next()
        .put({
          type: `${typePrefix}/rejected`,
          payload: new ConditionError(),
          meta: {
            arg: undefined,
            requestId,
            condition: true,
          }
        })
        .next()
        .isDone();
    });
  });
});