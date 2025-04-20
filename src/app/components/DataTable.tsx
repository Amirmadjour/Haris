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
    severity: "Medium",
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
    severity: "Medium",
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
    header: () => (
      <div className="flex items-center gap-1 ">
        Alert
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("alert")}</div>,
  },
  {
    accessorKey: "analyst",
    header: () => <div>Analyst</div>,
    cell: ({ row }) => <div>{row.getValue("analyst")}</div>,
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-1 cursor-pointer">
        Status
        <ChevronDown className="text-white" size={20}/>
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("status")}</div>,
  },
  {
    accessorKey: "severity",
    header: () => (
      <div className="flex items-center gap-1 cursor-pointer">
        Severity
        <ChevronDown className="text-white" size={20}/>
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("severity")}</div>,
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
      <div className="flex items-center py-4">
        {/* <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        /> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="border-b border-gray-dark">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-gray-dark hover:bg-white/5"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="text-white font-semibold text-xl"
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
                    <TableCell key={cell.id} className="text-white ">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div> */}
    </div>
  );
}
