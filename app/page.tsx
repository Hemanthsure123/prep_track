import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Interview Experience Intelligence Platform
          </CardTitle>
          <CardDescription>
            Catalog of interview experiences from top companies, presented as
            visually rich infographic pages.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            render={<Link href="/login" />}
            className="w-full sm:w-auto"
          >
            Login
          </Button>
          <Button
            render={<Link href="/signup" />}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Sign up
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
