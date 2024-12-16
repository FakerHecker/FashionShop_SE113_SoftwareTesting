import APIFilters from '../utils/apiFilters'; // Replace './APIFilters' with the actual path to your APIFilters class
import { jest } from '@jest/globals';

describe('APIFilters', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = {
      find: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
    };
  });

  describe('search()', () => {
    it('should filter by keyword in name (case-insensitive)', () => {
      const queryStr = { keyword: 'Áo' };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.search();

      expect(mockQuery.find).toHaveBeenCalledWith({
        name: { $regex: 'Áo', $options: 'i' },
      });
    });

    it('should filter by category name', () => {
      const queryStr = { keyword: 'Product', category: 'Electronics' };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.search();

      expect(mockQuery.find).toHaveBeenCalledWith({
        name: { $regex: 'Product', $options: 'i' },
        'category.name': 'Electronics',
      });
    });

    it('should filter by subCategory name', () => {
      const queryStr = { keyword: 'Product', subCategory: 'Phones' };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.search();

      expect(mockQuery.find).toHaveBeenCalledWith({
        name: { $regex: 'Product', $options: 'i' },
        'category.subCategory': 'Phones',
      });
    });

    it('should filter by subSubCategory name', () => {
      const queryStr = { keyword: 'Product', subSubCategory: 'iPhone' };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.search();

      expect(mockQuery.find).toHaveBeenCalledWith({
        name: { $regex: 'Product', $options: 'i' },
        'category.subSubCategory': 'iPhone',
      });
    });

    it('should return empty filter when no keyword is provided', () => {
      const queryStr = {};
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.search();

      expect(mockQuery.find).toHaveBeenCalledWith({});
    });
  });

  describe('filters()', () => {
    it('should filter by price range', () => {
      const queryStr = { price: { gt: '100', lt: '500' } };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({ price: { $gt: '100', $lt: '500' } });
    });

    it('should filter by multiple fields', () => {
      const queryStr = { price: { gte: '50' }, ratings: { lte: '4' } };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({
        price: { $gte: '50' },
        ratings: { $lte: '4' },
      });
    });

    it('should filter by category when present', () => {
      const queryStr = { category: 'TestCategory' };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({ 'category.name': 'TestCategory' });
      // Expect the second call to be with an empty object since other filters are removed
      expect(mockQuery.find.mock.calls[1][0]).toEqual({});
    });

    it('should ignore keyword, page, category, subCategory, subSubCategory, sort, and resPerPage fields', () => {
      const queryStr = {
        keyword: 'test',
        page: '2',
        category: 'Electronics',
        subCategory: 'Phones',
        subSubCategory: 'Smartphones',
        sort: 'price',
        resPerPage: '10',
        price: { gt: '100' },
      };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();
      expect(mockQuery.find.mock.calls[0][0]).toEqual({ 'category.name': 'Electronics' });
      expect(mockQuery.find).toHaveBeenCalledWith({ price: { $gt: '100' } });
    });

    it('should handle empty query string', () => {
      const queryStr = {};
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.filters();

      expect(mockQuery.find).toHaveBeenCalledWith({});
    });
  });

  describe('pagination()', () => {
    it('should paginate with default page 1', () => {
      const queryStr = {};
      const resPerPage = 10;
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.pagination(resPerPage);

      expect(mockQuery.limit).toHaveBeenCalledWith(resPerPage);
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
    });

    it('should paginate with specified page', () => {
      const queryStr = { page: '3' };
      const resPerPage = 5;
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.pagination(resPerPage);

      expect(mockQuery.limit).toHaveBeenCalledWith(resPerPage);
      expect(mockQuery.skip).toHaveBeenCalledWith(10); // 5 * (3 - 1) = 10
    });
  });

  describe('sorting()', () => {
    it('should sort by specified field ascending', () => {
      const queryStr = { sort: 'price' };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.sorting();

      expect(mockQuery.sort).toHaveBeenCalledWith('price');
    });

    it('should sort by specified fields multiple', () => {
      const queryStr = { sort: 'price,-ratings' };
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.sorting();

      expect(mockQuery.sort).toHaveBeenCalledWith('price -ratings');
    });

    it('should sort by createdAt descending by default', () => {
      const queryStr = {};
      const apiFilters = new APIFilters(mockQuery, queryStr);

      apiFilters.sorting();

      expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
    });
  });
});