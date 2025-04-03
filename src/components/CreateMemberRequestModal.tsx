import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Context } from "../main";

interface CreateMemberRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateMemberRequestModal: React.FC<CreateMemberRequestModalProps> = ({
  open,
  onClose,
}) => {
  const context = useContext(Context);
  
  // Проверяем, что контекст существует
  if (!context) {
    console.error("Context is not available");
    return null;
  }

  const { userStore, memberRequestsStore } = context;
  
  // Проверяем, что userStore.user существует, если нет, задаём пустые значения
  const user = userStore.user || { fullname: "", email: "" };

  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxMessageLength = 200;
  const remainingCharacters = maxMessageLength - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await memberRequestsStore.addRequest(user.fullname, email, message);
      onClose();
      setMessage("");
    } catch (error) {
      console.error("Error creating member request", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Send Member Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              className="border rounded p-2 w-full"
              value={message}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= maxMessageLength) {
                  setMessage(value);
                }
              }}
              placeholder="Enter your message..."
              required
              onFocus={(e) =>
                e.target.addEventListener(
                  "wheel",
                  function (e) {
                    e.preventDefault();
                  },
                  { passive: false }
                )
              }
            />
            <div className="text-right text-xs text-gray-500">
              {remainingCharacters} characters remaining
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemberRequestModal;
