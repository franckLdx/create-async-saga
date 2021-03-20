import { createAsyncSagaActions } from './toolkitActions';

describe('Should create ations', () => {
  test('Should create ations with no arg nor payload', () => {
    const actionType = 'testAction';
    const { action, pending, fulfilled, rejected } = createAsyncSagaActions(actionType);
    expect(action()).toStrictEqual({
      type: actionType,
      payload: undefined
    });
    expect(pending()).toStrictEqual({
      type: `${actionType}/pending`,
      payload: undefined,
      meta: { arg: undefined }
    });
    expect(fulfilled()).toStrictEqual({
      type: `${actionType}/fulfilled`,
      payload: undefined,
      meta: { arg: undefined }
    });
    const error = new Error("BOOM");
    expect(rejected(undefined, error)).toStrictEqual({
      type: `${actionType}/rejected`,
      payload: error,
      meta: { arg: undefined }
    });
  });

  test('Should create ations with arg and payload', () => {
    const actionType = 'testAction';
    const arg = "123";
    const payload = {
      name: "do",
      firstName: "john",
    };

    const { action, pending, fulfilled, rejected } = createAsyncSagaActions<typeof arg, typeof payload>(actionType);
    expect(action(arg)).toStrictEqual({
      type: actionType,
      payload: arg
    });
    expect(pending(arg)).toStrictEqual({
      type: `${actionType}/pending`,
      payload: undefined,
      meta: { arg }
    });
    expect(fulfilled(arg, payload)).toStrictEqual({
      type: `${actionType}/fulfilled`,
      payload,
      meta: { arg }
    });
    const error = new Error("BOOM");
    expect(rejected(arg, error)).toStrictEqual({
      type: `${actionType}/rejected`,
      payload: error,
      meta: { arg }
    });
  });

});