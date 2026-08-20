import { readStorage, writeStorage } from '@/lib/storage';

describe('storage helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reports read and parse failures without throwing', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(readStorage('key', value => value)).toBeNull();
    expect(getItem).toHaveBeenCalledWith('key');
  });

  it('reports write failures to the caller', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(writeStorage('key', 'value')).toBe(false);
  });

  it('returns parser failures as a read failure', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('bad');

    expect(
      readStorage('key', () => {
        throw new Error('invalid value');
      })
    ).toBeNull();
  });
});
