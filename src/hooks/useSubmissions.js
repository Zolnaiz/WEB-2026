import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createSubmission,
  getSubmissionById,
  getSubmissions,
  gradeSubmission,
  updateSubmission,
} from '../services/submissionService';

export function useSubmissions(initialParams = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState(initialParams);

  const fetchList = useCallback(
    async (override = {}) => {
      setLoading(true);
      setError('');
      try {
        const params = { ...queryParams, ...override, page, pageSize };
        const data = await getSubmissions(params);
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, queryParams]
  );

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return {
    items,
    loading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    setQueryParams,
    refetch: fetchList,
    createSubmission,
    updateSubmission,
    gradeSubmission,
    getSubmissionById,
  };
}
