import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getErrorMsg } from '../utils/helpers';

export const useApi = (apiFn, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFn(...args);
        setData(response.data);
        if (options.onSuccess) options.onSuccess(response.data);
        return response.data;
      } catch (err) {
        const msg = getErrorMsg(err);
        setError(msg);
        if (options.showError !== false) {
          toast.error(msg);
        }
        if (options.onError) options.onError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn, options]
  );

  return { data, loading, error, execute };
};