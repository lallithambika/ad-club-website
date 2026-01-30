"use client"

import { useAdmin } from "@/lib/admin-context"
import { AdminShell } from "@/components/admin/admin-shell"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MessageSquare, Mail, Calendar, Eye } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { ContactMessage } from "@/lib/admin-data"

export default function AdminMessagesPage() {
  const { messages, markMessageAsRead } = useAdmin()
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      const result = await markMessageAsRead(message.id)
      if (!result.ok) {
        toast.error(result.error ?? "Failed to mark as read")
      }
    }
  }

  const unreadCount = messages.filter((m) => !m.isRead).length

  return (
    <AdminShell>
      <AdminHeader
        title="Contact Messages"
        description={`You have ${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`}
      />

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages yet.</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card
              key={message.id}
              className={`border-0 shadow-sm cursor-pointer transition-colors hover:bg-muted/50 ${
                !message.isRead ? "bg-primary/5" : ""
              }`}
              onClick={() => openMessage(message)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{message.name}</h3>
                      {!message.isRead && (
                        <Badge className="bg-primary/10 text-primary">New</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{message.email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {message.date}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              <span className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                {selectedMessage?.email}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-foreground whitespace-pre-wrap">{selectedMessage?.message}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Received on {selectedMessage?.date}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
