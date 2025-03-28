import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Context } from "../main";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, PenSquare, Trash2 } from "lucide-react";
import { Label } from "@radix-ui/react-label";

const RentTimeTable = observer(() => {
  const { rentTimeStore } = useContext(Context)!;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRentTime, setEditingRentTime] = useState<any>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    rentTimeStore.loadRentTimes();
  }, [rentTimeStore]);

  const openAddDialog = () => {
    setEditingRentTime(null);
    setName("");
    setDialogOpen(true);
  };

  const openEditDialog = (rentTime: any) => {
    setEditingRentTime(rentTime);
    setName(rentTime.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    if (editingRentTime) {
      await rentTimeStore.updateRentTime(editingRentTime.id, { name });
    } else {
      await rentTimeStore.addRentTime({ name });
    }
    setDialogOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this rent time?")) {
      await rentTimeStore.removeRentTime(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rent Time Management</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Rent Time
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentTimeStore.rentTimes.map((rt) => (
              <TableRow key={rt.id}>
                <TableCell>{rt.id}</TableCell>
                <TableCell>{rt.name}</TableCell>
                <TableCell className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(rt)}>
                    <PenSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(rt.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rentTimeStore.rentTimes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No rent times found. Add a new rent time.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRentTime ? "Edit Rent Time" : "Add Rent Time"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="renttime-name">Name *</Label>
            <Input
              id="renttime-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter rent time name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingRentTime ? "Save Changes" : "Create Rent Time"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default RentTimeTable;
