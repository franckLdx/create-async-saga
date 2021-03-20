import { createAsyncSaga } from './createAsyncSaga';
import { testSaga } from 'redux-saga-test-plan';

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
        });
    });

    it('Should execute failed liefecycle', () => {
      const typePrefix = "SagaAfrica";
      const error = new Error("BOOM");
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
          payload: error,
          meta: { arg: undefined }
        });
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
        });
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