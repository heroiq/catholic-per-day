import { Firestore } from '@google-cloud/firestore';
import { firestoreCredentialsPath } from './config';

export function getFirestore() {
  const path = firestoreCredentialsPath;
  return !!path ? new Firestore({ keyFilename: path }) : new Firestore();
}
