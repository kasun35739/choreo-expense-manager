import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';

const cache = new NodeCache({
  stdTTL: 0,
  useClones: false,
  deleteOnExpire: true,
  maxKeys: 100,
});

const initialData = [
  
];

initialData.forEach((book) => {
  cache.set(book.uuid, book);
});

export default cache;
