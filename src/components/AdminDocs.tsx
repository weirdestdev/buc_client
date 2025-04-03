import React, { useState, useContext } from 'react';
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

const docsList = [
  { id: 'terms', title: 'Terms & Conditions' },
  { id: 'privacy', title: 'Privacy Policy' },
  { id: 'cookie', title: 'Cookie Policy' },
];

const AdminDocs = () => {
  // Состояние для хранения выбранных файлов
  const [files, setFiles] = useState<{
    terms: File | null;
    privacy: File | null;
    cookie: File | null;
  }>({
    terms: null,
    privacy: null,
    cookie: null,
  });

  // Состояния для модального окна
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // Получаем DocsStore из контекста
  const { docsStore } = useContext(Context)!;

  // Обработчик изменения файла для конкретного документа
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: "terms" | "privacy" | "cookie") => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [id]: e.target.files[0] });
    }
  };

  // Обработчик кнопки "Save" для загрузки выбранных файлов
  const handleSave = async () => {
    try {
      for (const docType of Object.keys(files) as ("terms" | "privacy" | "cookie")[]) {
        const file = files[docType];
        if (file) {
          await docsStore.uploadDocument(docType, file);
        }
      }
      console.log('Документы успешно сохранены.');
    } catch (error) {
      console.error('Ошибка при сохранении документов:', error);
    }
  };

  // Обработчик для чтения документа
  const handleReadDoc = async (docId: "terms" | "privacy" | "cookie", title: string) => {
    try {
      // Если запись существует, получаем путь к файлу
      const docRecord = docsStore.docs[docId];
      if (docRecord && docRecord.path) {
        const response = await fetch(docRecord.path);
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
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileChange(e, doc.id as "terms" | "privacy" | "cookie")}
                />
              </TableCell>
              <TableCell>
                {/* Если документ уже загружен, отображаем кнопку для чтения */}
                {docsStore.docs[doc.id as "terms" | "privacy" | "cookie"] && (
                  <Button size="sm" variant="outline" onClick={() => handleReadDoc(doc.id as "terms" | "privacy" | "cookie", doc.title)}>
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

      {/* Модальное окно для отображения текста документа */}
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
    </div>
  );
};

export default AdminDocs;
