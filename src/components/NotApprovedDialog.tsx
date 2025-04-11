// NotApprovedDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NotApprovedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotApprovedDialog: React.FC<NotApprovedDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your account not approved</DialogTitle>
          <DialogDescription>
            Please wait while an administrator approves your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotApprovedDialog;
