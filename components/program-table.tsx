import { GrantProgram } from "@/lib/db";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { truncateWords } from "@/hooks/helper-functions";

export interface ProgramTableProps {
  programs: GrantProgram[];
}

export function ProgramTable({ programs }: ProgramTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-xs overflow-hidden">
      <Table className="table-fixed min-w-100">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3 sm:w-[20%]">Program Name</TableHead>
            <TableHead className="w-1/4 sm:w-[45%]">Description</TableHead>
            <TableHead className="w-1/4 sm:w-[25%]">Deadline</TableHead>
            <TableHead className="w-1/5 sm:w-[10%] text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program) => (
            <TableRow key={program.id}>
              <TableCell className="font-medium align-top overflow-hidden whitespace-normal wrap-break-word">
                <Link
                  href={`/${program.id}`}
                  className="text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {truncateWords(program.name, 3)}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground align-top overflow-hidden whitespace-normal wrap-break-word">
                <p className="line-clamp-2">
                  {truncateWords(program.short_description, 10) || "-"}
                </p>
              </TableCell>
              <TableCell className="text-muted-foreground align-top whitespace-nowrap">
                {program.deadline.toLowerCase().includes("keine")
                  ? "-"
                  : truncateWords(program.deadline, 3)}
              </TableCell>
              <TableCell className="text-right align-top">
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/${program.id}`} />}
                >
                  View
                  <ArrowUpRightIcon data-icon="inline-end" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
