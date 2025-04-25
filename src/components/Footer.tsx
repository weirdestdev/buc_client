import React, { useState, useContext } from 'react';
import { ExternalLink, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
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

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const { docsStore } = useContext(Context)!;

  const handleFooterDoc = async (docType: 'terms' | 'privacy' | 'cookie', title: string) => {
    try {
      // Получаем документ через fetchDocument (если еще не получен, или обновляем)
      await docsStore.fetchDocument(docType);
      const docRecord = docsStore.docs[docType];
      if (docRecord && docRecord.path) {
        const url = `${import.meta.env.VITE_SERVER_URL}${docRecord.path}`;
        const response = await fetch(url);
        const text = await response.text();
        // Обработка текста: замена литеральных "\r\n" и "\n" на реальные символы перевода строки
        const processedText = text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n');
        setModalText(processedText);
        setModalTitle(title);
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Ошибка при чтении документа:', error);
    }
  };

  return (
    <>
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-display text-xl font-medium mb-4">Business Unit Club</h3>
              <p className="text-white/70 mb-6">
                Exclusive access to premium real estate and lifestyle services in Mallorca.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#just-arrived" className="text-white/70 hover:text-white transition-colors">
                    Our Portfolio
                  </a>
                </li>
                <li>
                  <a href="#portfolio" className="text-white/70 hover:text-white transition-colors">
                    Rentals
                  </a>
                </li>
                <li>
                  <a href="#leisure" className="text-white/70 hover:text-white transition-colors">
                    Leisure
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-white/70 hover:text-white transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#collaborators" className="text-white/70 hover:text-white transition-colors">
                    Partners
                  </a>
                </li>
                <li>
                  <Link to="/admin" className="text-white/70 hover:text-white transition-colors flex items-center">
                    <LogIn className="w-4 h-4 mr-1" />
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Contact</h3>
              <address className="not-italic text-white/70">
                <p>Carrer de Sant Magí, 32</p>
                <p>07013 Palma de Mallorca</p>
                <p>Spain</p>
                <p className='mt-4 mb-4'>Office: Carrer de Miguel Machado, 3, 07181 Palmanova, Mallorca</p>
                <p className="mt-4">
                  <a href="mailto:info@businessunit.club" className="hover:text-white transition-colors">
                    info@businessunit.club
                  </a>
                </p>
                <p className="mt-1">
                  <a href="tel:+34672203674" className="hover:text-white transition-colors">
                    +34 672 203 674
                  </a>
                </p>
                <p className="mt-1">
                  <a href="tel:+34672203674" className="hover:text-white transition-colors">
                    +34 655 166 949
                  </a>
                </p>
                <p className="mt-4 text-xs">
                  Built by{' '}
                  <a
                    href="https://creativepeople.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block animate-gradient-slow bg-gradient-to-r from-blue-400 via-green-400 to-cyan-500 bg-clip-text text-transparent font-medium hover:underline"
                  >
                    CreativePeople
                  </a>
                </p>
              </address>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-white/50 text-sm flex flex-col md:flex-row justify-between items-center">
            <div>&copy; {new Date().getFullYear()} Business Unit Club. All rights reserved.</div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleFooterDoc('privacy', 'Privacy Policy');
                }}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleFooterDoc('terms', 'Terms & Conditions');
                }}
                className="hover:text-white transition-colors"
              >
                Terms & Conditions
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleFooterDoc('cookie', 'Cookie Policy');
                }}
                className="hover:text-white transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

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
    </>
  );
}
