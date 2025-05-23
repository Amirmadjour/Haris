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

// Remove the hardcoded TEAM_MEMBERS and fetch them instead
const fetchTeamMembers = async () => {
  try {
    const response = await fetch("/api/team-members");
    const data = await response.json();
    console.log("data as members: ", data);
    return data || [];
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return [];
  }
};

export const columns = (
  updateRow: (serial: string, updates: Partial<Alert>) => void,
  teamMembers: any[] // Add teamMembers as parameter
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
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-1 cursor-pointer">
              Analyst
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
            <DropdownMenuCheckboxItem
              className="font-medium text-white hover:bg-white/5 font-poppins"
              checked={!column.getFilterValue()}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => column.setFilterValue(undefined)}
            >
              All Analysts
            </DropdownMenuCheckboxItem>
            {teamMembers.map((member) => (
              <DropdownMenuCheckboxItem
                key={member.name}
                checked={column.getFilterValue() === member.name}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(checked) => {
                  column.setFilterValue(checked ? member.name : undefined);
                }}
                className="font-medium text-white hover:bg-white/5 font-poppins"
              >
                {member.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    cell: ({ row }) => {
      const currentStatus = row.getValue("status") as string;
      const currentAnalyst = row.getValue("analyst") as string;

      return (
        <DropdownMenu>
          {currentStatus == "Open" ? (
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-1 cursor-pointer">
                Unassigned
                <ChevronDown className="text-white" size={16} />
              </div>
            </DropdownMenuTrigger>
          ) : (
            <div className="flex items-center gap-1">{currentAnalyst}</div>
          )}
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
                {teamMembers.map((member, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="text-white hover:bg-white/5"
                    onClick={async () => {
                      try {
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
                              assignedTo: member.name,
                            }),
                          }
                        );

                        if (response.ok) {
                          updateRow(row.original._serial, {
                            status: "Assigned",
                            analyst: member.name,
                          });
                        }
                      } catch (error) {
                        console.error("Failed to update status:", error);
                      }
                    }}
                  >
                    {member.name}
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
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return row.getValue(columnId) === filterValue;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      const statuses = [
        "Open",
        "Assigned",
        "Under Engineering Review",
        "Closed",
      ];
      const filterValues = (column.getFilterValue() as string[]) || [];

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
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValues: string[]) => {
      if (!filterValues || filterValues.length === 0) return true;
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
    enableGlobalFilter: false,
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
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    if (data && data.length > 0) {
      setTableData(data);
    }
  }, [data]);

  React.useEffect(() => {
    const loadTeamMembers = async () => {
      const members = await fetchTeamMembers();
      console.log("members: ", members);
      setTeamMembers(members);
    };
    loadTeamMembers();
  }, []);

  const updateRow = (serial: string, updates: Partial<Alert>) => {
    setTableData((prevData) =>
      prevData.map((row) =>
        row._serial === serial ? { ...row, ...updates } : row
      )
    );
  };

  const table = useReactTable<Alert>({
    data: tableData,
    columns: columns(updateRow, teamMembers), // Pass teamMembers to columns
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    autoResetPageIndex: false,
  });

  return (
    <div className="w-full px-20">
      <div className="border-b border-gray-dark">
        <DataTablePagination
          table={table}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
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
              <TableRow className="hover:bg-white/5">
                <TableCell colSpan={5} className="h-24 text-center text-white">
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
