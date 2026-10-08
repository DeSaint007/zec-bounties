"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmt } from "@/lib/utils";

export type StaffRelation = "created" | "assigned" | "applied";

export type StaffBountyRow = {
  id: string;
  title: string;
  status: string;
  chain: "MAIN" | "TEST";
  bountyAmount: number;
  isPrivate: boolean;
  isPaid: boolean;
  isApproved: boolean;
  dateCreated: string;
  completedAt: string | null;
  paidAt: string | null;
  teamName: string | null;
  relations: StaffRelation[];
  applicationStatus: string | null;
};

export type StaffBountyView = {
  userId: string;
  displayName: string;
  chain: "MAIN" | "TEST";
  limit: number;
  open: StaffBountyRow[];
  openTotal: number;
  openNextOffset: number | null;
  history: StaffBountyRow[];
  historyTotal: number;
  historyNextOffset: number | null;
};

const STATUS_LABEL: Record<string, string> = {
  TO_DO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const RELATION_LABEL: Record<StaffRelation, string> = {
  created: "Created",
  assigned: "Assigned",
  applied: "Applied",
};

function Row({ row }: { row: StaffBountyRow }) {
  return (
    <li className="flex flex-col gap-1 border-b border-border/60 py-2 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/bounty/${row.id}`}
          className="text-sm font-medium hover:underline truncate"
        >
          {row.title}
        </Link>
        <span className="text-xs tabular-nums text-muted-foreground shrink-0">
          {fmt(row.bountyAmount)} ZEC
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {STATUS_LABEL[row.status] || row.status}
        </Badge>
        {row.relations.map((relation) => (
          <Badge key={relation} variant="outline" className="text-[10px] px-1.5 py-0">
            {RELATION_LABEL[relation]}
          </Badge>
        ))}
        {row.applicationStatus && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            App {row.applicationStatus}
          </Badge>
        )}
        {row.isPrivate && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Private
          </Badge>
        )}
        {row.isPaid && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Paid
          </Badge>
        )}
        {!row.isApproved && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Unapproved
          </Badge>
        )}
        {row.teamName && (
          <span className="text-[11px] text-muted-foreground">{row.teamName}</span>
        )}
      </div>
    </li>
  );
}

function List({
  title,
  total,
  rows,
  onLoadMore,
}: {
  title: string;
  total: number;
  rows: StaffBountyRow[];
  onLoadMore?: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">
        {title} ({rows.length}{total > rows.length ? ` of ${total}` : ""})
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">None</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </ul>
      )}
      {onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Load more
        </button>
      )}
    </div>
  );
}

export function StaffViewCard({
  chain,
  loading,
  error,
  data,
  onLoadMoreOpen,
  onLoadMoreHistory,
}: {
  chain: "MAIN" | "TEST";
  loading: boolean;
  error: string | null;
  data: StaffBountyView | null;
  onLoadMoreOpen?: () => void;
  onLoadMoreHistory?: () => void;
}) {
  return (
    <Card className="border-amber-500/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Staff view
          <Badge variant="outline" className="text-[10px] font-normal">
            Admin
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Open bounties and history for this user on{" "}
          {chain === "MAIN" ? "mainnet" : "testnet"}. Ignores their privacy
          flags. Not shown to non-admins.
        </p>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading staff view
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {data && (
          <>
            <List
              title="Open"
              total={data.openTotal}
              rows={data.open}
              onLoadMore={data.openNextOffset == null ? undefined : onLoadMoreOpen}
            />
            <List
              title="History"
              total={data.historyTotal}
              rows={data.history}
              onLoadMore={
                data.historyNextOffset == null ? undefined : onLoadMoreHistory
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
