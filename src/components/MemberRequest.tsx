import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Member {
  id: number;
  name: string;
  email: string;
  role: 'member' | 'moderator' | 'admin';
  joined: string; // дата регистрации
}

const initialMembers: Member[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'member', joined: '2025-03-20' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'moderator', joined: '2025-03-22' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', joined: '2025-03-25' },
];

const MemberRequest: React.FC = () => {
  const [members] = useState<Member[]>(initialMembers);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Members</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.id}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.joined}</TableCell>
                <TableCell>
                  <Button onClick={() => openModal(member)}>View Details</Button>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <p><strong>ID:</strong> {selectedMember.id}</p>
              <p><strong>Name:</strong> {selectedMember.name}</p>
              <p><strong>Email:</strong> {selectedMember.email}</p>
              <p><strong>Role:</strong> {selectedMember.role}</p>
              <p><strong>Joined:</strong> {selectedMember.joined}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberRequest;
