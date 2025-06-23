
'use server';

import {
  doc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type SupportTicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface SupportTicket {
  id: string;
  userId: string;
  email: string;
  subject: string;
  category: string;
  description: string;
  status: SupportTicketStatus;
  createdAt: number; // as timestamp
  updatedAt?: number;
}

export interface SupportTicketFirestoreRecord {
    userId: string;
    email: string;
    subject: string;
    category: string;
    description: string;
    status: SupportTicketStatus;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

const SUPPORT_TICKETS_COLLECTION = 'support_tickets';

export async function addSupportTicketToFirestore(
  ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!ticketData.userId) {
    throw new Error('User ID is required to create a support ticket.');
  }
  try {
    const collectionRef = collection(db, SUPPORT_TICKETS_COLLECTION);
    const docData = {
        ...ticketData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collectionRef, docData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding support ticket to Firestore:', error);
    throw new Error('Failed to create support ticket in the database.');
  }
}

export async function getSupportTicketsFromFirestore(userId: string): Promise<SupportTicket[]> {
  if (!userId) {
    console.warn('getSupportTicketsFromFirestore called without userId. Returning empty array.');
    return [];
  }
  try {
    const collectionRef = collection(db, SUPPORT_TICKETS_COLLECTION);
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const tickets: SupportTicket[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const createdAt = (data.createdAt as Timestamp)?.toDate().getTime() || Date.now();
      const updatedAt = (data.updatedAt as Timestamp)?.toDate().getTime();
      tickets.push({
        id: docSnap.id,
        ...data,
        createdAt,
        updatedAt
      } as SupportTicket);
    });
    return tickets;
  } catch (error) {
    console.error('Error fetching support tickets from Firestore:', error);
    throw new Error('Failed to fetch support tickets from the database.');
  }
}
