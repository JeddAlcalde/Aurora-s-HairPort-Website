import {dbConnection} from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const users = getCollectionFn('users');
export const employees = getCollectionFn('employees');
export const appointments = getCollectionFn('appointments');
export const services = getCollectionFn('services');
export const schedules = getCollectionFn('schedules');

