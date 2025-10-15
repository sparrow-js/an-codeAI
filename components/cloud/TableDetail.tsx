'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cloudStore, cloudActions } from '@/lib/stores/cloud';
import { 
  ChevronLeft, 
  Filter, 
  Plus, 
  Download, 
  Columns3, 
  RefreshCw,
  ChevronDown,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/shadui/button';

interface TableDetailViewProps {
  chatId: string;
}

export default function TableDetailView({ chatId }: TableDetailViewProps) {
  const state = useStore(cloudStore);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { selectedTable, tableData, loadingTableData } = state;

  useEffect(() => {
    if (selectedTable) {
      cloudActions.loadTableData(chatId, selectedTable, currentPage, pageSize);
    }
  }, [chatId, selectedTable, currentPage, pageSize]);

  const handleRefresh = async () => {
    if (!selectedTable) return;
    setIsRefreshing(true);
    await cloudActions.loadTableData(chatId, selectedTable, currentPage, pageSize);
    setIsRefreshing(false);
  };

  const handleBack = () => {
    cloudActions.setCurrentView('database');
  };

  if (!selectedTable) {
    return (
      <div className="p-6">
        <div className="text-gray-400">No table selected</div>
      </div>
    );
  }

  const totalPages = tableData ? Math.ceil(tableData.totalCount / pageSize) : 1;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, tableData?.totalCount || 0);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header with back button */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2 px-6 py-3">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Database
          </Button>
        </div>
      </div>

      {/* Page header */}
      <div className="px-6 py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white mb-1">
          Viewing table {selectedTable}
        </h1>
        <p className="text-gray-400 text-sm">
          Viewing records in the {selectedTable} table. Double click a value to edit in-line.
        </p>
      </div>

      {/* Action bar */}
      <div className="px-6 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <Columns3 className="w-4 h-4 mr-2" />
            Columns
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || loadingTableData}
            variant="outline"
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table content */}
      <div className="flex-1 overflow-auto">
        {loadingTableData ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading table data...</div>
          </div>
        ) : !tableData || tableData.rows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-2">No data</div>
              <p className="text-gray-500 text-sm">This table has no records yet</p>
            </div>
          </div>
        ) : (
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead className="bg-zinc-950 sticky top-0 z-10">
                <tr>
                  <th className="border-r border-b border-zinc-800 px-4 py-3 text-left">
                    <input type="checkbox" className="rounded border-zinc-700" />
                  </th>
                  {tableData.columns.map((column) => (
                    <th
                      key={column.name}
                      className="border-r border-b border-zinc-800 px-4 py-3 text-left text-sm font-semibold text-white min-w-[150px]"
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.name}</span>
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-zinc-900 border-b border-zinc-800"
                  >
                    <td className="border-r border-zinc-800 px-4 py-2">
                      <input type="checkbox" className="rounded border-zinc-700" />
                    </td>
                    {tableData.columns.map((column) => (
                      <td
                        key={column.name}
                        className="border-r border-zinc-800 px-4 py-2 text-sm text-gray-300"
                      >
                        <div className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {row[column.name] === null ? (
                            <span className="text-gray-600 italic">NULL</span>
                          ) : typeof row[column.name] === 'object' ? (
                            <span className="text-gray-400">
                              {JSON.stringify(row[column.name])}
                            </span>
                          ) : (
                            String(row[column.name])
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      {tableData && tableData.rows.length > 0 && (
        <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="text-sm text-gray-400">
              {tableData.totalCount} {tableData.totalCount === 1 ? 'record' : 'records'} found
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-50"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="border-zinc-700 hover:bg-zinc-800 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

