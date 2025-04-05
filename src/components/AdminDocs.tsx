import React, { useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Context } from '@/main';
import * as Toast from '@radix-ui/react-toast';

const docsList = [
  { id: 'terms', title: 'Terms & Conditions' },
  { id: 'privacy', title: 'Privacy Policy' },
  { id: 'cookie', title: 'Cookie Policy' },
];

const AdminDocs = () => {
  const [files, setFiles] = useState<{ terms: File | null; privacy: File | null; cookie: File | null }>({
    terms: null,
    privacy: null,
    cookie: null,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const { docsStore } = useContext(Context)!;

  useEffect(() => {
    (async () => {
      for (const doc of docsList) {
        await docsStore.fetchDocument(doc.id as 'terms' | 'privacy' | 'cookie');
      }
    })();
  }, [docsStore]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: 'terms' | 'privacy' | 'cookie') => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type !== 'text/plain') {
        alert('Пожалуйста, выберите файл с расширением .txt');
        return;
      }
      setFiles((prev) => ({ ...prev, [id]: e.target.files![0] }));
    }
  };

  const handleSave = async () => {
    try {
      for (const docType of Object.keys(files) as ('terms' | 'privacy' | 'cookie')[]) {
        const file = files[docType];
        if (file) {
          await docsStore.uploadDocument(docType, file).catch((error) => {
            console.error(`Error uploading ${docType}:`, error);
          });
        }
      }
      setToastOpen(true);
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  };

  const handleReadDoc = async (docId: 'terms' | 'privacy' | 'cookie', title: string) => {
    try {
      const docRecord = docsStore.docs[docId];
      if (docRecord && docRecord.path) {
        const url = `${import.meta.env.VITE_SERVER_URL}${docRecord.path}`;
        const response = await fetch(url);
        const text = await response.text();
        setModalText(text);
        setModalTitle(title);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при чтении документа:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Docs Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>File</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docsList.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.title}</TableCell>
              <TableCell>
                <input type="file" accept=".txt" onChange={(e) => handleFileChange(e, doc.id as 'terms' | 'privacy' | 'cookie')} />
              </TableCell>
              <TableCell>
                {docsStore.docs[doc.id as 'terms' | 'privacy' | 'cookie']?.path && (
                  <Button size="sm" variant="outline" onClick={() => handleReadDoc(doc.id as 'terms' | 'privacy' | 'cookie', doc.title)}>
                    Read Document
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleSave} className="mt-4">
        Save
      </Button>

      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription style={{ whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto' }}>
            {modalText}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setModalOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          duration={1500}
          // Кастомные классы для позиционирования и стилизации (пример с TailwindCSS)
          className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-md shadow-lg"
        >
          <Toast.Title className="font-bold">Success</Toast.Title>
          <Toast.Description className="mt-1">
            Documents saved successfully.
          </Toast.Description>
          <Toast.Action asChild altText="Close">
            <button
              onClick={() => setToastOpen(false)}
              className="ml-4 text-sm underline"
            >
              Close
            </button>
          </Toast.Action>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </div>
  );
};

export default observer(AdminDocs);
