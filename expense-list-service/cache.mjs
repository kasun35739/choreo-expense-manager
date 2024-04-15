import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';

const cache = new NodeCache({
  stdTTL: 0,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 100,
});

const initialData = [
  {
    uuid: uuidv4(),
    title: 'The Fellowship of the Ring',
    date: '02/04/2024',
    category: 'Recurring',
    amount: 10.11,
  },
  {
    uuid: uuidv4(),
    title: 'The Two Towers',
    date: '03/04/2024',
    category: 'Captial',
    amount: 20.12,
  },
  {
    uuid: uuidv4(),
    title: 'The Return of the King',
    date: '04/04/2024',
    category: 'Other',
    amount: 30.43,
  },
];

initialData.forEach((book) => {
  cache.set(book.uuid, book);
});

export default cache;
