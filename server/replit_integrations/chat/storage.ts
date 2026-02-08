import { db, collections } from "../../db";
import { Timestamp } from "firebase-admin/firestore";

// Chat storage types (simplified for Firestore)
export interface Conversation {
  id: number;
  title: string;
  createdAt: Date;
}

export interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: Date;
}

export interface IChatStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;
}

// Helper functions
function docToConversation(doc: FirebaseFirestore.DocumentSnapshot): Conversation | undefined {
  if (!doc.exists) return undefined;
  const data = doc.data();
  return {
    id: parseInt(doc.id),
    title: data?.title || "",
    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
  };
}

function docToMessage(doc: FirebaseFirestore.DocumentSnapshot): Message | undefined {
  if (!doc.exists) return undefined;
  const data = doc.data();
  return {
    id: parseInt(doc.id),
    conversationId: data?.conversationId || 0,
    role: data?.role || "",
    content: data?.content || "",
    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
  };
}

async function getNextId(collection: string): Promise<number> {
  const snapshot = await db.collection(collection).get();
  let maxId = 0;
  snapshot.docs.forEach((doc) => {
    const id = parseInt(doc.id) || 0;
    if (id > maxId) maxId = id;
  });
  return maxId + 1;
}

export const chatStorage: IChatStorage = {
  async getConversation(id: number) {
    const doc = await db.collection("conversations").doc(id.toString()).get();
    return docToConversation(doc);
  },

  async getAllConversations() {
    const snapshot = await db.collection("conversations").orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => docToConversation(doc)!).filter(Boolean);
  },

  async createConversation(title: string) {
    const newId = await getNextId("conversations");
    const conversation = {
      id: newId,
      title,
      createdAt: new Date(),
    };
    await db
      .collection("conversations")
      .doc(newId.toString())
      .set({
        title,
        createdAt: Timestamp.fromDate(new Date()),
      });
    return conversation;
  },

  async deleteConversation(id: number) {
    const idStr = id.toString();
    // Delete all messages in this conversation
    const messagesSnapshot = await db
      .collection("messages")
      .where("conversationId", "==", id)
      .get();
    const batch = db.batch();
    messagesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(db.collection("conversations").doc(idStr));
    await batch.commit();
  },

  async getMessagesByConversation(conversationId: number) {
    const snapshot = await db
      .collection("messages")
      .where("conversationId", "==", conversationId)
      .orderBy("createdAt", "asc")
      .get();
    return snapshot.docs.map((doc) => docToMessage(doc)!).filter(Boolean);
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const newId = await getNextId("messages");
    const message = {
      id: newId,
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };
    await db.collection("messages").doc(newId.toString()).set({
      conversationId,
      role,
      content,
      createdAt: Timestamp.fromDate(new Date()),
    });
    return message;
  },
};
