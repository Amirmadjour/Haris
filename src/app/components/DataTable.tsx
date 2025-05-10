"use client";
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
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
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "./DataTablePagination";
import { Alert } from "@/lib/splunkAlerts";
import { useRouter } from "next/navigation";

const TEAM_MEMBERS = [
  "Madjour amir",
  "radhi badache",
  "Amine chell",
  "Faisal Ghamdi",
];

export const columns = (
  updateRow: (serial: string, updates: Partial<Alert>) => void
): ColumnDef<Alert>[] => [
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
    cell: ({ row }) => {
      const currentStatus = row.getValue("status") as string;
      const currentAnalyst = row.getValue("analyst") as string;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer">
              {currentAnalyst || "Unassigned"}
              {currentStatus === "Open" && (
                <ChevronDown className="text-white" size={16} />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-secondary border-gray-dark"
          >
            {currentStatus === "Open" ? (
              <>
                <DropdownMenuLabel className="text-white">
                  Assign to
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-dark" />
                {TEAM_MEMBERS.map((member) => (
                  <DropdownMenuItem
                    key={member}
                    className="text-white hover:bg-white/5"
                    onClick={async () => {
                      try {
                        // Call your API to update the status and analyst
                        const response = await fetch(
                          "/api/alerts/update-status",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              serial: row.original._serial,
                              status: "Assigned",
                              assignedTo: member,
                            }),
                          }
                        );

                        if (response.ok) {
                          // Update the local data
                          updateRow(row.original._serial, {
                            status: "Assigned",
                            analyst: member,
                          });
                        }
                      } catch (error) {
                        console.error("Failed to update status:", error);
                      }
                    }}
                  >
                    {member}
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <DropdownMenuItem className="text-white pointer-events-none">
                {currentAnalyst || "No analyst assigned"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const statuses = ["Open", "Assigned", "Under Engineering review"];
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
      const severities = ["Info", "Low", "Medium", "High", "Critical"];
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


export function DataTable({ data = [], isLoading = false }) {
  const [tableData, setTableData] = React.useState<Alert[]>(data);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const router = useRouter();

  React.useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
    }
  }, [data]);

  const updateRow = (serial: string, updates: Partial<Alert>) => {
    setTableData((prevData) =>
      prevData.map((row) =>
        row._serial === serial ? { ...row, ...updates } : row
      )
    );
  };

  const table = useReactTable<Alert>({
    data: tableData,
    columns: columns(updateRow),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    autoResetPageIndex: false,
  });

  return (
    <div className="w-full px-20">
      <div className="border-b border-gray-dark">
        <DataTablePagination table={table} />
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
            {isLoading ? (
              // Loading skeleton state
              [...Array(5)].map((_, rowIndex) => (
                <TableRow
                  key={`skeleton-${rowIndex}`}
                  className="border-gray-dark h-16 hover:bg-white/5"
                >
                  {table.getAllLeafColumns().map((column, colIndex) => (
                    <TableCell
                      key={`skeleton-cell-${rowIndex}-${colIndex}`}
                      className="text-white font-medium font-poppins"
                    >
                      <Skeleton className="h-4 w-full bg-white/5" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              // Normal data state
              table.getRowModel().rows.map((row) => {
                const serial = row.original._serial;

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-gray-dark hover:bg-white/5 h-16"
                    onClick={() => router.push(`/alerts/${serial}`)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isSeverityCell = cell.column.id === "severity";
                      const severityValue = cell.getValue() as string;

                      let bgColor = "";
                      if (isSeverityCell) {
                        switch (severityValue) {
                          case "Critical":
                            bgColor = "bg-red-500";
                            break;
                          case "High":
                            bgColor = "bg-[#FDFD9A] text-black";
                            break;
                          case "Medium":
                            bgColor = "bg-[#DCFD77] text-black";
                            break;
                          case "Low":
                            bgColor = "bg-[#C4FDFD] text-black";
                            break;
                          case "Info":
                            bgColor = "bg-[#C4FD6F] text-black";
                            break;
                          default:
                            bgColor = "";
                        }
                      }

                      return (
                        <TableCell
                          key={cell.id}
                          className={`text-white font-medium font-poppins`}
                        >
                          <div className={`${bgColor} p-2 w-fit rounded-md`}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              // Empty state
              <TableRow className="hover:bg-white/5">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-white"
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
