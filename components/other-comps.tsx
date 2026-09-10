import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardDescription,
  CardContent,
} from "./ui/card";

export interface GrantCard {
  name: string;
  desc: string;
  deadline: string;
  href: string;
}

import Link from "next/link";
import { Button } from "@base-ui/react";

export function GrantCard({ name, desc, deadline, href }: GrantCard) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="line-clamp-1">
          <Link href={href} className="text-xl">
            {name}
          </Link>
        </CardTitle>
        <CardDescription className="sr-only">{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {desc !== "" ? (
            <p className="line-clamp-3">{desc}</p>
          ) : (
            <p className="text-lg">Keine Description Vorhanden</p>
          )}
          {deadline.toLowerCase().includes("keine") ? (
            <span className="text-sm">{deadline}</span>
          ) : (
            <span className="text-sm text-red-400">{deadline}</span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="text-indigo-600 text-base hover:underline underline-offset-4">
          <Link href={href}>Seite Sehen</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

{
  /* <div style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
  {programs.map((program) => (
    <article
      key={program.id}
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem 0" }}>
        <Link href={`/${program.id}`}>{program.name}</Link>
      </h2>
      <p style={{ margin: "0 0 1rem 0", color: "#444" }}>
        {program.short_description}
      </p>
      <div style={{ fontSize: "0.875rem", color: "#888" }}>
        <strong>Deadline:</strong> {program.deadline}
      </div>
    </article>
  ))}
</div>; */
}
