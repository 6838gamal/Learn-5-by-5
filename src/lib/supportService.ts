
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
    
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<SupportTicketFirestoreRecord, 'createdAt' | 'updatedAt'> & { createdAt: Timestamp | null, updatedAt: Timestamp | null };
      
      const createdAt = data.createdAt?.toDate().getTime() || Date.now();
      const updatedAt = data.updatedAt?.toDate().getTime();

      return {
        id: docSnap.id,
        userId: data.userId,
        email: data.email,
        subject: data.subject,
        category: data.category,
        description: data.description,
        status: data.status,
        createdAt,
        updatedAt,
      };
    });
  } catch (error: any) {
    console.error('Error fetching support tickets from Firestore:', error);
    // Check for the specific error code or message for a missing index
    if (error.code === 'failed-precondition' && error.message?.includes('requires an index')) {
        const helpfulMessage = `A database index is required to fetch support tickets. This is a one-time setup. Please check your browser's developer console (F12). Firebase usually provides a direct link there to create the necessary index in your Firestore database. The query needs an index on 'userId' (ascending) and 'createdAt' (descending).`;
        throw new Error(helpfulMessage);
    }
    throw new Error('Failed to fetch support tickets from the database. Please ensure Firestore is configured correctly.');
  }
}
