import { jest } from '@jest/globals';

const connectMock = jest.fn();
const disconnectMock = jest.fn();

jest.unstable_mockModule('mongoose', () => ({
  default: {
    connect: connectMock,
    disconnect: disconnectMock,
  },
}));

const { connectDatabase, disconnectDatabase } = await import('../src/config/db.js');

describe('database connection', () => {
  const originalMongoUri = process.env.MONGO_URI;
  const originalTimeout = process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGO_URI = 'mongodb://mongo:27017/factoryflow_test';
    delete process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS;
  });

  afterAll(() => {
    if (originalMongoUri === undefined) {
      delete process.env.MONGO_URI;
    } else {
      process.env.MONGO_URI = originalMongoUri;
    }

    if (originalTimeout === undefined) {
      delete process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS;
    } else {
      process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS = originalTimeout;
    }
  });

  it('connects with the configured URI and timeout', async () => {
    connectMock.mockResolvedValue(undefined);
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    await connectDatabase();

    expect(connectMock).toHaveBeenCalledWith(
      'mongodb://mongo:27017/factoryflow_test',
      { serverSelectionTimeoutMS: 5000 },
    );
    expect(infoSpy).toHaveBeenCalledWith('MongoDB connection established');

    infoSpy.mockRestore();
  });

  it('uses the configured server selection timeout', async () => {
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS = '1000';
    connectMock.mockResolvedValue(undefined);

    await connectDatabase();

    expect(connectMock).toHaveBeenCalledWith(
      'mongodb://mongo:27017/factoryflow_test',
      { serverSelectionTimeoutMS: 1000 },
    );
  });

  it('throws when MONGO_URI is missing', async () => {
    delete process.env.MONGO_URI;

    await expect(connectDatabase()).rejects.toThrow(
      'Missing required environment variable: MONGO_URI',
    );
    expect(connectMock).not.toHaveBeenCalled();
  });

  it('logs and rethrows a connection error', async () => {
    const error = new Error('database unavailable');
    connectMock.mockRejectedValue(error);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(connectDatabase()).rejects.toBe(error);

    expect(errorSpy).toHaveBeenCalledWith(
      'MongoDB connection failed:',
      'database unavailable',
    );

    errorSpy.mockRestore();
  });

  it('disconnects from MongoDB', async () => {
    disconnectMock.mockResolvedValue(undefined);

    await disconnectDatabase();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});
