import { Alert, Box, Show } from '@chakra-ui/react';
import React, { useState, useCallback } from 'react';

import type { TTxsFilters } from 'types/api/txsFilters';
import type { QueryKeys } from 'types/client/queries';
import type { Sort } from 'types/client/txs-sort';

import * as cookies from 'lib/cookies';
import DataFetchAlert from 'ui/shared/DataFetchAlert';

import TxsHeader from './TxsHeader';
import TxsSkeletonDesktop from './TxsSkeletonDesktop';
import TxsSkeletonMobile from './TxsSkeletonMobile';
import TxsWithSort from './TxsWithSort';
import useQueryWithPages from './useQueryWithPages';

type Props = {
  queryName: QueryKeys;
  showDescription?: boolean;
  stateFilter?: TTxsFilters['filter'];
  apiPath: string;
}

const TxsContent = ({
  queryName,
  showDescription,
  stateFilter,
  apiPath,
}: Props) => {
  const [ sorting, setSorting ] = useState<Sort>(cookies.get(cookies.NAMES.TXS_SORT) as Sort || '');
  // const [ filters, setFilters ] = useState<Partial<TTxsFilters>>({ type: [], method: [] });

  const sort = useCallback((field: 'val' | 'fee') => () => {
    setSorting((prevVal) => {
      let newVal: Sort = '';
      if (field === 'val') {
        if (prevVal === 'val-asc') {
          newVal = '';
        } else if (prevVal === 'val-desc') {
          newVal = 'val-asc';
        } else {
          newVal = 'val-desc';
        }
      }
      if (field === 'fee') {
        if (prevVal === 'fee-asc') {
          newVal = '';
        } else if (prevVal === 'fee-desc') {
          newVal = 'fee-asc';
        } else {
          newVal = 'fee-desc';
        }
      }
      cookies.set(cookies.NAMES.TXS_SORT, newVal);
      return newVal;
    });
  }, [ ]);

  const {
    data,
    isLoading,
    isError,
    pagination,
  } = useQueryWithPages(apiPath, queryName, stateFilter && { filter: stateFilter });
  // } = useQueryWithPages({ ...filters, filter: stateFilter, apiPath });

  if (isError) {
    return <DataFetchAlert/>;
  }

  const txs = data?.items;

  if (!isLoading && !txs) {
    return <Alert>There are no transactions.</Alert>;
  }

  let content = (
    <>
      <Show below="lg" ssr={ false }><TxsSkeletonMobile/></Show>
      <Show above="lg" ssr={ false }><TxsSkeletonDesktop/></Show>
    </>
  );

  if (!isLoading && txs) {
    content = <TxsWithSort txs={ txs } sorting={ sorting } sort={ sort }/>;
  }

  const paginationProps = {
    ...pagination,
    hasNextPage: data?.next_page_params !== undefined && data?.next_page_params !== null && Object.keys(data?.next_page_params).length > 0,
  };

  return (
    <>
      { showDescription && <Box mb={ 12 }>Only the first 10,000 elements are displayed</Box> }
      <TxsHeader sorting={ sorting } paginationProps={ paginationProps }/>
      { content }
    </>
  );
};

export default TxsContent;
