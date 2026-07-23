import { toast } from 'react-hot-toast';
import { getAuthToken, clearAuth, saveAuth } from './lib/auth-client.ts';

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  GET = 'get',
}

export const auth = {
  get currentUser() {
    const user = localStorage.getItem('bivax_user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return {
          ...parsed,
          getIdToken: async () => localStorage.getItem('bivax_token') || ''
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  onAuthStateChanged: (callback: (user: any) => void) => {
    const handler = () => {
      const user = localStorage.getItem('bivax_user');
      if (user) {
        try {
          const parsed = JSON.parse(user);
          callback({
            ...parsed,
            getIdToken: async () => localStorage.getItem('bivax_token') || ''
          });
        } catch (e) {
          callback(null);
        }
      } else {
        callback(null);
      }
    };
    window.addEventListener('auth_change', handler);
    handler();
    return () => window.removeEventListener('auth_change', handler);
  },
  signOut: async () => {
    console.log("signOut called");
    clearAuth();
    return Promise.resolve();
  }
} as any;

async function safeJsonResponse(res: Response) {
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: `Server returned non-JSON response (${res.status})` };
    }
  } catch (err: any) {
    return { error: err.message || 'JSON parse error' };
  }
}

export const db = {
  collection: (name: string) => ({
    _name: name,
    doc: (id: string) => ({
      _name: name,
      id: id,
      get: async () => {
        try {
          const token = getAuthToken();
          const res = await fetch(`/api/${name === 'users' ? 'user/profile' : name + '/' + id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await safeJsonResponse(res);
          return { exists: () => !!data && !data.error, data: () => data, id };
        } catch {
          return { exists: () => false, data: () => null, id };
        }
      },
      update: async (data: any) => {
        try {
          const token = getAuthToken();
          const res = await fetch(`/api/${name}/${id}`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          return await safeJsonResponse(res);
        } catch (e: any) {
          return { error: e.message };
        }
      }
    }),
    get: async () => {
      try {
        const token = getAuthToken();
        const user = JSON.parse(localStorage.getItem('bivax_user') || '{}');
        const isAdmin = !!user.is_admin;
        
        let endpoint = `/api/${name}`;
        if (isAdmin && (name === 'users' || name === 'trades' || name === 'transactions')) {
          endpoint = `/api/admin/${name}`;
        }

        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await safeJsonResponse(res);
        return {
          docs: (Array.isArray(data) ? data : []).map((d: any) => ({
            id: d.id || d.uid,
            data: () => d,
            exists: () => true
          })),
          empty: !(Array.isArray(data) && data.length > 0)
        };
      } catch {
        return { docs: [], empty: true };
      }
    }
  })
} as any;

export async function signInWithEmailAndPassword(a: any, email: string, pass: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  const data = await safeJsonResponse(res);
  if (data.error) throw new Error(data.error);
  saveAuth(data.token, data.user);
  return { user: data.user };
}

export async function createUserWithEmailAndPassword(a: any, email: string, pass: string) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass })
  });
  const data = await safeJsonResponse(res);
  if (data.error) throw new Error(data.error);
  saveAuth(data.token, data.user);
  return { user: data.user };
}

export const signInWithPopup = async (a: any, p: any) => {
  const res = await fetch('/api/auth/google/url');
  const data = await safeJsonResponse(res);
  const url = data.url;
  if (!url) throw new Error(data.error || 'Failed to get OAuth URL');
  
  return new Promise((resolve, reject) => {
    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(url, 'google-login', `width=${width},height=${height},left=${left},top=${top}`);
    
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'OAUTH_AUTH_SUCCESS') {
        saveAuth(event.data.token, event.data.user);
        window.removeEventListener('message', handler);
        resolve({ user: event.data.user });
      }
    };
    window.addEventListener('message', handler);
  }) as Promise<any>;
};

export function handleFirestoreError(error: any, operation?: OperationType, path?: string, ...args: any[]) {
  console.error(`API Error [${operation}] at ${path}:`, error, args);
  if (error && error.message) {
     toast.error(error.message);
  }
}

// Re-exports for compatibility
export const onAuthStateChanged = (authObj: any, cb: any) => authObj.onAuthStateChanged(cb);
export const signOut = (authObj: any) => authObj.signOut();
export const reauthenticateWithCredential = async (...args: any[]) => {};
export const updatePassword = async (...args: any[]) => {};
export const updateEmail = async (...args: any[]) => {};
export const sendEmailVerification = async (...args: any[]) => {};
export const GoogleAuthProvider = class {};
export const EmailAuthProvider = { credential: (...args: any[]) => ({}) };
export const sendPasswordResetEmail = async (...args: any[]) => {};
export const collection = (dbObj: any, ...path: string[]) => {
  let basePath = '';
  if (dbObj) {
    if (typeof dbObj._name === 'string') {
      basePath = dbObj._name;
      if (dbObj.id) {
        basePath += '/' + dbObj.id;
      }
    } else if (typeof dbObj.path === 'string') {
      basePath = dbObj.path;
    }
  }

  const fullPathParts: string[] = [];
  if (basePath) {
    fullPathParts.push(...basePath.split('/').filter(Boolean));
  }
  for (const p of path) {
    if (typeof p === 'string') {
      fullPathParts.push(...p.split('/').filter(Boolean));
    }
  }

  const fullPath = fullPathParts.join('/');
  if (dbObj && typeof dbObj.collection === 'function' && !basePath) {
    return dbObj.collection(fullPath);
  }
  return db.collection(fullPath);
};

export const doc = (dbObj: any, ...path: string[]) => {
  let basePath = '';
  if (dbObj) {
    if (typeof dbObj._name === 'string') {
      basePath = dbObj._name;
      if (dbObj.id) {
        basePath += '/' + dbObj.id;
      }
    } else if (typeof dbObj.path === 'string') {
      basePath = dbObj.path;
    }
  }

  const allParts: string[] = [];
  if (basePath) {
    allParts.push(...basePath.split('/').filter(Boolean));
  }
  for (const p of path) {
    if (typeof p === 'string') {
      allParts.push(...p.split('/').filter(Boolean));
    }
  }

  if (allParts.length === 0) {
    const randomId = Math.random().toString(36).substring(2, 15);
    return db.collection('default').doc(randomId);
  }

  if (allParts.length % 2 === 1) {
    const colPath = allParts.join('/');
    const randomId = Math.random().toString(36).substring(2, 15);
    return db.collection(colPath).doc(randomId);
  } else {
    const docId = allParts.pop()!;
    const colPath = allParts.join('/');
    return db.collection(colPath).doc(docId);
  }
};

export const getDoc = (ref: any) => ref && typeof ref.get === 'function' ? ref.get() : Promise.resolve({ exists: () => false, data: () => ({}) });
export const getDocs = (queryRef: any) => queryRef && typeof queryRef.get === 'function' ? queryRef.get() : Promise.resolve({ docs: [], empty: true });
export const setDoc = (ref: any, data: any, ...args: any[]) => ref && typeof ref.update === 'function' ? ref.update(data) : Promise.resolve();
export const updateDoc = (ref: any, data: any, ...args: any[]) => ref && typeof ref.update === 'function' ? ref.update(data) : Promise.resolve();
export const addDoc = async (colRef: any, data: any) => {
  const name = colRef?._name || '';
  const token = getAuthToken();
  
  let endpoint = `/api/${name}`;
  let method = 'POST';
  let bodyData: any = data;

  if (name === 'deposits' || name === 'transactions') {
    endpoint = '/api/wallet/deposit';
  } else if (name === 'withdrawals') {
    endpoint = '/api/wallet/withdraw';
  } else if (name === 'trades') {
    endpoint = '/api/trades/place';
  } else if (name === 'tickets') {
    endpoint = '/api/tickets';
    const ticketId = data.ticketId || colRef.id || ('t_' + Math.random().toString(36).substring(2, 11));
    bodyData = { ticketId, ticketData: data };
  } else if (name && name.startsWith('tickets/') && name.endsWith('/messages')) {
    endpoint = '/api/tickets/messages';
    const parts = name.split('/');
    const ticketId = parts[1];
    const messageId = data.messageId || ('m_' + Math.random().toString(36).substring(2, 11));
    bodyData = { ticketId, messageId, messageData: data };
  }

  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(bodyData)
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        clearAuth();
      }
      const errorText = await res.text();
      throw new Error(`Proxy addDoc failed for ${name}: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const result = await res.json();
    return { id: result.id || bodyData.ticketId || bodyData.messageId || 'new-id' };
  } catch (err) {
    console.error(`Proxy addDoc error for ${name}:`, err);
    throw err;
  }
};
export const deleteDoc = async (ref: any) => {
  if (ref && ref._name && ref.id) {
    const token = getAuthToken();
    try {
      await fetch(`/api/${ref._name}/${ref.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error("deleteDoc failed", e);
    }
  }
  return Promise.resolve();
};
export const onSnapshot = (ref: any, cb: any, errCb?: any) => {
  ref.get().then((s: any) => cb(s)).catch((e: any) => errCb && errCb(e));
  return () => {};
};
export const query = (ref: any, ...args: any[]) => ref;
export const where = (...args: any[]) => ({});
export const orderBy = (...args: any[]) => ({});
export const limit = (n: number) => ({});
export const serverTimestamp = () => Date.now();
export const increment = (n: number) => ({ increment: n });
export const collectionGroup = (dbObj: any, name: string) => dbObj.collection(name);
export const runTransaction = (dbObj: any, cb: any) => {
  return cb({
    get: (ref: any) => ref.get(),
    set: (ref: any, data: any) => ref.update(data),
    update: (ref: any, data: any) => ref.update(data),
    delete: (ref: any) => Promise.resolve(),
  });
};
