import { jest } from '@jest/globals';

const ordreRepository = {
  findOrders: jest.fn(),
  countOrders: jest.fn(),
};

jest.unstable_mockModule('../src/repositories/ordreRepository.js', () => ordreRepository);

const { getFilteredOrdersService } = await import('../src/services/orderService.js');

describe('Order service pagination', () => {
  beforeEach(() => {
    ordreRepository.findOrders.mockReset();
    ordreRepository.countOrders.mockReset();
    ordreRepository.findOrders.mockResolvedValue([{ code: 'OF-001' }]);
    ordreRepository.countOrders.mockResolvedValue(21);
  });

  it('passes filters and pagination to the repository and returns page metadata', async () => {
    const result = await getFilteredOrdersService({
      statut: 'en_cours',
      produit: 'product-id',
      assigneA: 'operator-id',
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      page: '2',
      limit: '10',
    });

    const [filter, skip, limit] = ordreRepository.findOrders.mock.calls[0];
    expect(filter).toMatchObject({
      statut: 'EN_COURS',
      produit: 'product-id',
      assigneA: 'operator-id',
    });
    expect(filter.createdAt.$gte).toBeInstanceOf(Date);
    expect(filter.createdAt.$lte).toBeInstanceOf(Date);
    expect([skip, limit]).toEqual([10, 10]);
    expect(result).toMatchObject({
      orders: [{ code: 'OF-001' }],
      total: 21,
      totalPages: 3,
      currentPage: 2,
    });
  });

  it('rejects invalid pagination without querying the repository', async () => {
    await expect(getFilteredOrdersService({ page: '0' })).rejects.toThrow(
      'page doit être positif et limit doit être compris entre 1 et 100.'
    );
    expect(ordreRepository.findOrders).not.toHaveBeenCalled();
    expect(ordreRepository.countOrders).not.toHaveBeenCalled();
  });
});
