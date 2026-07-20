declare module 'firebase/auth' {
  import { FirebaseApp } from '@firebase/app';
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    emailVerified: boolean;
    metadata: { creationTime?: string; lastSignInTime?: string };
    providerData: { providerId: string; uid: string; displayName: string | null; email: string | null; phoneNumber: string | null; photoURL: string | null }[];
    refreshToken: string;
    tenantId: string | null;
    delete(): Promise<void>;
    getIdToken(forceRefresh?: boolean): Promise<string>;
    getIdTokenResult(forceRefresh?: boolean): Promise<object>;
    reload(): Promise<void>;
    toJSON(): object;
  }
  export interface UserCredential {
    user: User;
    providerId: string | null;
    operationType: string;
  }
  export interface Auth {
    app: FirebaseApp;
    name: string;
    config: object;
    currentUser: User | null;
    languageCode: string | null;
    tenantId: string | null;
    settings: object;
    onAuthStateChanged(nextOrObserver: ((user: User | null) => void) | object, error?: (error: Error) => void, completed?: () => void): () => void;
    signOut(): Promise<void>;
    useDeviceLanguage(): void;
  }
  export interface ConfirmationResult {
    confirm(verificationCode: string): Promise<UserCredential>;
    verificationId: string;
  }
  export class RecaptchaVerifier {
    constructor(auth: Auth, containerIdOrOptions: string | object, parameters?: object);
    type: string;
    clear(): void;
    render(): Promise<number>;
    verify(): Promise<string>;
  }
  export type Persistence = object;
  export const browserLocalPersistence: Persistence;
  export const browserSessionPersistence: Persistence;
  export function getAuth(app?: FirebaseApp): Auth;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: ((user: User | null) => void) | object, error?: (error: Error) => void, completed?: () => void): () => void;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithPopup(auth: Auth, provider: object): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>;
  export function sendEmailVerification(user: User): Promise<void>;
  export function updateProfile(user: User, profile: { displayName?: string; photoURL?: string }): Promise<void>;
  export function setPersistence(auth: Auth, persistence: Persistence): Promise<void>;
  export function connectAuthEmulator(auth: Auth, url: string, options?: { disableWarnings?: boolean }): void;
  export function signInWithPhoneNumber(auth: Auth, phoneNumber: string, applicationVerifier: RecaptchaVerifier): Promise<ConfirmationResult>;
  export class GoogleAuthProvider {
    static PROVIDER_ID: string;
    constructor();
    setCustomParameters(params: object): void;
    addScope(scope: string): void;
  }
  export class GithubAuthProvider {
    static PROVIDER_ID: string;
    constructor();
    setCustomParameters(params: object): void;
    addScope(scope: string): void;
  }
  export class OAuthProvider {
    constructor(providerId: string);
    setCustomParameters(params: object): void;
    addScope(scope: string): void;
  }
  export class PhoneAuthProvider {
    constructor(auth: Auth);
    verifyPhoneNumber(options: object, applicationVerifier: RecaptchaVerifier): Promise<string>;
    static credential(verificationId: string, verificationCode: string): object;
  }
  export const multiFactor: (auth: Auth) => { getSession(): Promise<object>; enroll(assertion: object, displayName?: string): Promise<void>; unenroll(option: object): Promise<void> };
  export const PhoneMultiFactorGenerator: { assertion(credential: object): object };
}

declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: object;
    automaticDataCollectionEnabled: boolean;
  }
  export function initializeApp(options: object, name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/firestore' {
  import { FirebaseApp } from 'firebase/app';
  export function getFirestore(app?: FirebaseApp): object;
  export function connectFirestoreEmulator(db: object, host: string, port: number): void;
  export function doc(db: object, path: string, ...pathSegments: string[]): object;
  export function collection(db: object, path: string, ...pathSegments: string[]): object;
  export function getDoc(ref: object): Promise<{ exists(): boolean; data(): object | undefined; id: string }>;
  export function getDocs(ref: object): Promise<{ docs: { id: string; data(): object }[]; empty: boolean }>;
  export function setDoc(ref: object, data: object): Promise<void>;
  export function updateDoc(ref: object, data: object): Promise<void>;
  export function addDoc(ref: object, data: object): Promise<{ id: string }>;
  export function deleteDoc(ref: object): Promise<void>;
  export function query(ref: object, ...constraints: object[]): object;
  export function where(fieldPath: string, opStr: string, value: unknown): object;
  export function orderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): object;
  export function limit(n: number): object;
  export function serverTimestamp(): object;
  export class Timestamp { constructor(seconds: number, nanoseconds: number); static now(): Timestamp; static fromDate(date: Date): Timestamp; static fromMillis(milliseconds: number): Timestamp; toMillis(): number; toDate(): Date; seconds: number; nanoseconds: number; }
}

declare module 'firebase/storage' {
  import { FirebaseApp } from 'firebase/app';
  export function getStorage(app?: FirebaseApp): object;
  export function connectStorageEmulator(storage: object, host: string, port: number): void;
  export function ref(storage: object, path?: string): object;
  export function uploadBytes(ref: object, data: Blob | Uint8Array | ArrayBuffer): Promise<{ ref: object; metadata: object }>;
  export function getDownloadURL(ref: object): Promise<string>;
  export function deleteObject(ref: object): Promise<void>;
}
