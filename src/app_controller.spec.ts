import { AppController } from './app_controller.js';

describe('AppController', () => {
  it('reports ok', () => {
    expect(new AppController().health()).toEqual({ status: 'ok' });
  });
});
