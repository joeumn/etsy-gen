"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tickets = [
    {
      id: "TICKET-001",
      subject: "API Connection Issue",
      status: "resolved",
      priority: "high",
      createdAt: "2025-01-10",
      updatedAt: "2025-01-11",
    },
    {
      id: "TICKET-002",
      subject: "Product generation slow",
      status: "in_progress",
      priority: "medium",
      createdAt: "2025-01-14",
      updatedAt: "2025-01-15",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubject("");
    setMessage("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Support & Help</h1>
          <p className="text-muted-foreground">
            Get help or submit a support ticket
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submit Ticket Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Submit Support Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full h-40 px-3 py-2 border rounded-md resize-none bg-background"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-flame-gradient text-white hover:opacity-90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Quick Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                FAQs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Contact Team
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Previous Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {ticket.status === "resolved" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : ticket.status === "in_progress" ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-semibold">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.id} • Created {ticket.createdAt}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      ticket.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : ticket.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

