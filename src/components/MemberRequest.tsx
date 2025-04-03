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

interface MemberRequest {
  id: number;
  date: string; // дата и время отправки
  memberName: string;
  email: string;
  message: string; // текст до 200 символов
  status: 'new' | 'viewed' | 'completed';
}

const initialRequests: MemberRequest[] = [
  {
    id: 1,
    date: '2025-04-01 10:30',
    memberName: 'Иван Иванов',
    email: 'ivan@mail.com',
    message: 'Привет, мне нужна помощь с регистрацией.',
    status: 'new',
  },
  {
    id: 2,
    date: '2025-04-02 14:15',
    memberName: 'Мария Петрова',
    email: 'maria@mail.com',
    message: 'Хочу оставить отзыв по работе сайта.',
    status: 'viewed',
  },
];

const MemberRequests: React.FC = () => {
  const [requests, setRequests] = useState<MemberRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<MemberRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Функция для изменения статуса заявки
  const handleStatusChange = (id: number, newStatus: MemberRequest['status']) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
    // Если заявка открыта в модальном окне, обновляем и её
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  // Открытие модального окна с подробной информацией
  const openModal = (request: MemberRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Member Requests</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Member Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.id}</TableCell>
                <TableCell>{req.date}</TableCell>
                <TableCell>{req.memberName}</TableCell>
                <TableCell>{req.email}</TableCell>
                <TableCell>
                  <select
                    value={req.status}
                    onChange={(e) =>
                      handleStatusChange(req.id, e.target.value as MemberRequest['status'])
                    }
                  >
                    <option value="new">New</option>
                    <option value="viewed">Viewed</option>
                    <option value="completed">Completed</option>
                  </select>
                </TableCell>
                <TableCell>
                  <Button onClick={() => openModal(req)}>Details</Button>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No member requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Модальное окно с подробной информацией */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Member Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <p>
                <strong>ID:</strong> {selectedRequest.id}
              </p>
              <p>
                <strong>Date & Time:</strong> {selectedRequest.date}
              </p>
              <p>
                <strong>Member Name:</strong> {selectedRequest.memberName}
              </p>
              <p>
                <strong>Email:</strong> {selectedRequest.email}
              </p>
              <p>
                <strong>Message:</strong> {selectedRequest.message}
              </p>
              <p>
                <strong>Status:</strong>
                <select
                  value={selectedRequest.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedRequest.id,
                      e.target.value as MemberRequest['status']
                    )
                  }
                  className="ml-2 border rounded p-1"
                >
                  <option value="new">New</option>
                  <option value="viewed">Viewed</option>
                  <option value="completed">Completed</option>
                </select>
              </p>
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

export default MemberRequests;
