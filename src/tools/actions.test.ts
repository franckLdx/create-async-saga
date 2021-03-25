import { createAsyncSagaActions } from './actions';
import { ConditionError } from './error';

describe('Should create ations', () => {
  test('Should create ations with no arg nor payload', () => {
    const typePrefix = 'testAction';
    const { action, pending, fulfilled, rejected } = createAsyncSagaActions(typePrefix);
    const triggerAction = action();
    const requestId = triggerAction.meta.requestId;
    expect(triggerAction).toStrictEqual({
      type: typePrefix,
      payload: undefined,
      meta: { requestId }
    });
    expect(pending(undefined, requestId)).toStrictEqual({
      type: `${typePrefix}/pending`,
      payload: undefined,
      meta: {
        arg: undefined,
        requestId
      }
    });
    expect(fulfilled(undefined, requestId)).toStrictEqual({
      type: `${typePrefix}/fulfilled`,
      payload: undefined,
      meta: {
        arg: undefined,
        requestId
      }
    });
    const error = new Error("BOOM");
    expect(rejected(undefined, requestId, error)).toStrictEqual({
      type: `${typePrefix}/rejected`,
      payload: error,
      meta: {
        arg: undefined,
        requestId,
        condition: false,
      }
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
    const triggerAction = action(arg);
    const requestId = triggerAction.meta.requestId;
    expect(triggerAction).toStrictEqual({
      type: typePrefix,
      payload: arg,
      meta: { requestId }
    });
    expect(pending(arg, requestId)).toStrictEqual({
      type: `${typePrefix}/pending`,
      payload: undefined,
      meta: {
        arg,
        requestId
      }
    });
    expect(fulfilled(arg, requestId, payload)).toStrictEqual({
      type: `${typePrefix}/fulfilled`,
      payload,
      meta: {
        arg,
        requestId
      }
    });
    const error = new Error("BOOM");
    expect(rejected(arg, requestId, error)).toStrictEqual({
      type: `${typePrefix}/rejected`,
      payload: error,
      meta: {
        arg,
        requestId,
        condition: false,
      }
    });
    const conditionError = new ConditionError();
    expect(rejected(arg, requestId, conditionError)).toStrictEqual({
      type: `${typePrefix}/rejected`,
      payload: conditionError,
      meta: {
        arg,
        requestId,
        condition: true,
      }
    });
  });

});