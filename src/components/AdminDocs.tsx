import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const docsList = [
  { id: 'terms', title: 'Terms & Conditions' },
  { id: 'privacy', title: 'Privacy Policy' },
  { id: 'cookie', title: 'Cookie Policy' },
];

const AdminDocs = () => {
  // Состояние для хранения выбранных файлов
  const [files, setFiles] = useState({
    terms: null,
    privacy: null,
    cookie: null,
  });

  // Обработчик изменения файла для конкретного документа
  const handleFileChange = (e, id) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [id]: e.target.files[0] });
    }
  };

  // Обработчик кнопки "Save"
  const handleSave = () => {
    console.log('Сохранение документов:', files);
    // Здесь можно добавить вызов API для сохранения или обновления файлов
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Docs Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>File</TableHead>
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
                  onChange={(e) => handleFileChange(e, doc.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleSave} className="mt-4">
        Save
      </Button>
    </div>
  );
};

export default AdminDocs;
