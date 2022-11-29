import Functionary from '../src/index';

describe('TEST ', () => {
  it('test', async () => {
    const test = new Functionary({ apikey: 'hello' });

    expect(test).toBeTruthy();
  });
});
