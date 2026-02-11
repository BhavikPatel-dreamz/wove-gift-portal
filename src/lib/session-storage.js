import {prisma} from './db.js';

export class PrismaSessionStorage {
  async storeSession(session) {
    try {
      
      await prisma.shopifySession.upsert({
        where: { shop: session.shop },
        update: {
          accessToken: session.accessToken,
          scope: session.scope,
          isOnline: session.isOnline,
          expiresAt: session.expires ? new Date(session.expires) : null,
          updatedAt: new Date(),
        },
        create: {
          shop: session.shop,
          accessToken: session.accessToken,
          scope: session.scope,
          isOnline: session.isOnline,
          expiresAt: session.expires ? new Date(session.expires) : null,
        },
      });
      return true;
    } catch (error) {
      console.error('Error storing session:', error);
      throw error;
    }
  }

  async loadSession(id) {
    try {
      const session = await prisma.shopifySession.findUnique({
        where: { shop: id },
      });
      
      if (!session) return undefined;
      
      return {
        id: session.shop,
        shop: session.shop,
        accessToken: session.accessToken,
        scope: session.scope,
        isOnline: session.isOnline,
        expires: session.expiresAt,
      };
    } catch (error) {
      console.error('Error loading session:', error);
      return undefined;
    }
  }

  async deleteSession(id) {
    try {
      await prisma.shopifySession.delete({
        where: { shop: id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  async deleteSessions(ids) {
    try {
      await prisma.shopifySession.deleteMany({
        where: { 
          shop: { 
            in: ids 
          } 
        },
      });
      return true;
    } catch (error) {
      console.error('Error deleting sessions:', error);
      return false;
    }
  }

  async findSessionsByShop(shop) {
    try {
      const sessions = await prisma.shopifySession.findMany({
        where: { shop },
      });
      
      return sessions.map(session => ({
        id: session.shop,
        shop: session.shop,
        accessToken: session.accessToken,
        scope: session.scope,
        isOnline: session.isOnline,
        expires: session.expiresAt,
      }));
    } catch (error) {
      console.error('Error finding sessions by shop:', error);
      return [];
    }
  }
}