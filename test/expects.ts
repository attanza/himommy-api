export const generalExpect = (
  expect: jest.Expect,
  body: any,
  status: number,
  message: string
) => {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(status);
  expect(body.meta.message).toBeDefined();
  expect(body.meta.message).toEqual(message);
};
