"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const data: Payment[] = [
  {
    id: "m5gr84i9",
    alert: "YAHMI - Suspicious Execution blocked by Trellix | T1204 4o",
    analyst: "Faisal Ghamdi",
    status: "success",
    email: "ken99@example.com",
    severity: "Low",
  },
  {
    id: "3u1reuv4",
    alert: "YAHMI - Suspicious Execution blocked by Trellix | T1204 4o",
    analyst: "Faisal Ghamdi",
    status: "success",
    email: "Abe45@example.com",
    severity: "Medium",
  },
  {
    id: "derv1ws0",
    alert: "YAHMI - Suspicious Execution blocked by Trellix | T1204 4o",
    analyst: "Faisal Ghamdi",
    status: "processing",
    email: "Monserrat44@example.com",
    severity: "Medium",
  },
  {
    id: "5kma53ae",
    alert: "YAHMI - Suspicious Execution blocked by Trellix | T1204 4o",
    analyst: "Faisal Ghamdi",
    status: "success",
    email: "Silas22@example.com",
    severity: "High",
  },
  {
    id: "bhqecj4p",
    alert: "YAHMI - Suspicious Execution blocked by Trellix | T1204 4o",
    analyst: "Faisal Ghamdi",
    status: "failed",
    email: "carmella@example.com",
    severity: "Medium",
  },
];

export type Payment = {
  id: string;
  alert: string;
  analyst: string;
  status: "pending" | "processing" | "success" | "failed";
  severity: "Medium" | "Low" | "High";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "alert",
    header: () => <div className="flex items-center gap-1 ">Alert</div>,
    cell: ({ row }) => <div>{row.getValue("alert")}</div>,
  },
  {
    accessorKey: "analyst",
    header: () => <div>Analyst</div>,
    cell: ({ row }) => <div>{row.getValue("analyst")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const statuses = ["pending", "processing", "success", "failed"];
      const filterValues = (column.getFilterValue() as string[]) || statuses;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer">
              Status
              <ChevronDown className="text-white" size={20} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="bg-secondary border-gray-dark"
          >
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-secondary rotate-45 border-t border-l border-gray-dark" />
            </div>
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filterValues.includes(status)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(checked) => {
                  const newFilterValues = checked
                    ? [...filterValues, status]
                    : filterValues.filter((v) => v !== status);
                  column.setFilterValue(
                    newFilterValues.length ? newFilterValues : undefined
                  );
                }}
                className="font-medium text-white hover:bg-white/5 font-poppins"
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => <div>{row.getValue("status")}</div>,
    filterFn: (row, columnId, filterValues: string[]) => {
      return filterValues.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "severity",
    header: ({ column }) => {
      const severities = ["Medium", "Low", "High"];
      const filterValues = (column.getFilterValue() as string[]) || severities;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer">
              Severity
              <ChevronDown className="text-white" size={20} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="bg-secondary border-gray-dark"
          >
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-secondary rotate-45 border-t border-l border-gray-dark" />
            </div>
            {severities.map((severity) => (
              <DropdownMenuCheckboxItem
                key={severity}
                checked={filterValues.includes(severity)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(checked) => {
                  const newFilterValues = checked
                    ? [...filterValues, severity]
                    : filterValues.filter((v) => v !== severity);
                  column.setFilterValue(
                    newFilterValues.length ? newFilterValues : undefined
                  );
                }}
                className="text-white font-medium font-poppins"
              >
                {severity}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => <div>{row.getValue("severity")}</div>,
    filterFn: (row, columnId, filterValues: string[]) => {
      return filterValues.includes(row.getValue(columnId));
    },
  },
];

export function DataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full px-20">
      <div className="border-b border-gray-dark">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-gray-dark hover:bg-white/5 h-16"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="text-white font-semibold text-xl font-poppins"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-gray-dark hover:bg-white/5 h-16"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-white font-medium font-poppins"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-white/5">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-white "
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
