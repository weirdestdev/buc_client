import React, { useEffect, useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
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
import { Context } from '../main';
import { IMemberRequest } from '@/store/MemberRequestsStore';

const MemberRequests: React.FC = observer(() => {
  const { memberRequestsStore } = useContext(Context)!;
  const [selectedRequest, setSelectedRequest] = useState<IMemberRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // При монтировании получаем список запросов
  useEffect(() => {
    memberRequestsStore.fetchRequests();
  }, [memberRequestsStore]);

  // Функция для обновления статуса через стор
  const handleStatusChange = (id: number, newStatus: IMemberRequest['status']) => {
    memberRequestsStore.changeRequestStatus(id, newStatus);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  // Открытие модального окна с подробной информацией
  const openModal = (request: IMemberRequest) => {
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
              <TableHead>Rental Name</TableHead> {/* Новая колонка */}
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberRequestsStore.requests.length > 0 ? (
              memberRequestsStore.requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.id}</TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{req.memberName}</TableCell>
                  <TableCell>{req.rentalName}</TableCell> {/* Отображение rentalName */}
                  <TableCell>{req.email}</TableCell>
                  <TableCell>
                    <select
                      value={req.status}
                      onChange={(e) =>
                        handleStatusChange(req.id, e.target.value as IMemberRequest['status'])
                      }
                      className="border rounded p-1"
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
                <strong>Date & Time:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Member Name:</strong> {selectedRequest.memberName}
              </p>
              <p>
                <strong>Rental Name:</strong> {selectedRequest.rentalName}
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
                      e.target.value as IMemberRequest['status']
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
});

export default MemberRequests;
