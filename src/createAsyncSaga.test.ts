import { createAsyncSaga } from './createAsyncSaga';
import { testSaga } from 'redux-saga-test-plan';

describe('createAsyncSaga', () => {
  it('Should execute sucessful liefecycle  with no arg', () => {
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
});