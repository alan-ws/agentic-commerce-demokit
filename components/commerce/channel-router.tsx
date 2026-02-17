"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Store, Globe } from "lucide-react";

interface Channel {
  type: "d2c" | "retailer";
  name: string;
  url: string;
  priority: number;
}

interface ChannelRouterProps {
  productId: string;
  productName: string;
  channels: Channel[];
}

export function ChannelRouter({
  productName,
  channels,
}: ChannelRouterProps) {
  const d2cChannels = channels.filter((c) => c.type === "d2c");
  const retailerChannels = channels.filter((c) => c.type === "retailer");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Where to buy {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {d2cChannels.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Direct</span>
              <Badge variant="secondary" className="text-xs">
                Official
              </Badge>
            </div>
            {d2cChannels.map((ch) => (
              <Button
                key={ch.name}
                variant="default"
                className="w-full justify-between"
                asChild
              >
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ch.name}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
        )}

        {retailerChannels.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Retailers</span>
            </div>
            {retailerChannels.map((ch) => (
              <Button
                key={ch.name}
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ch.name}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
