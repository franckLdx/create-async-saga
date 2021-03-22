import { createAsyncSagaActions } from './toolkitActions';

describe('Should create ations', () => {
  test('Should create ations with no arg nor payload', () => {
    const typePrefix = 'testAction';
    const { action, pending, fulfilled, rejected } = createAsyncSagaActions(typePrefix);
    expect(action()).toStrictEqual({
      type: typePrefix,
      payload: undefined
    });
    expect(pending()).toStrictEqual({
      type: `${typePrefix}/pending`,
      payload: undefined,
      meta: { arg: undefined }
    });
    expect(fulfilled()).toStrictEqual({
      type: `${typePrefix}/fulfilled`,
      payload: undefined,
      meta: { arg: undefined }
    });
    const error = new Error("BOOM");
    expect(rejected(undefined, error)).toStrictEqual({
      type: `${typePrefix}/rejected`,
      payload: error,
      meta: { arg: undefined }
    });
  });

  test('Should create ations with arg and payload', () => {
    const typePrefix = 'testAction';
    const arg = "123";
    const payload = {
      name: "do",
      firstName: "john",
    };

    const { action, pending, fulfilled, rejected } = createAsyncSagaActions<typeof payload, typeof arg>(typePrefix);
    expect(action(arg)).toStrictEqual({
      type: typePrefix,
      payload: arg
    });
    expect(pending(arg)).toStrictEqual({
      type: `${typePrefix}/pending`,
      payload: undefined,
      meta: { arg }
    });
    expect(fulfilled(arg, payload)).toStrictEqual({
      type: `${typePrefix}/fulfilled`,
      payload,
      meta: { arg }
    });
    const error = new Error("BOOM");
    expect(rejected(arg, error)).toStrictEqual({
      type: `${typePrefix}/rejected`,
      payload: error,
      meta: { arg }
    });
  });

});