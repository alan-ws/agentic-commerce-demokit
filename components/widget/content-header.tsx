"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentHeaderProps {
  productName: string;
}

export function ContentHeader({ productName }: ContentHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b bg-background">
      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
        <Link href="/widget">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <nav className="text-sm text-muted-foreground">
        <span>Collection</span>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">{productName}</span>
      </nav>
    </div>
  );
}
