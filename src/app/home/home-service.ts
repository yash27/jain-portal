import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  where,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  doc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  private readonly userInstanceName: string = 'users';
  private readonly uniqueIdInstanceName: string = 'uniqueId';
  private readonly adminLoginsInstanceName: string = 'adminUsers';

  private userCollectionInstance = collection(this.firestore, this.userInstanceName);
  private uniqueIdCollectionInstance = collection(this.firestore, this.uniqueIdInstanceName);
  private adminLoginsCollectionInstance = collection(this.firestore, this.adminLoginsInstanceName);
   
  users$ = collectionData(this.userCollectionInstance, {idField: 'id'}) as Observable<User[]>;
  uniqueId$ = collectionData(this.uniqueIdCollectionInstance, {idField: 'id'}) as Observable<any>;
  adminLogins$ = collectionData(this.adminLoginsCollectionInstance, {idField: 'id'}) as Observable<any>;

  constructor(private firestore: Firestore) {}

  adminUsersList: any = [];

  fetchUsersFromFirestore() {
    return this.users$;
  }

  fetchAdminLoginsFromFirestore() {
    this.adminLogins$.subscribe(adminLogins => this.adminUsersList = adminLogins);
  }

  addUserInFirestore(user: User) {
    return addDoc(collection(this.firestore, this.userInstanceName), user)
  }

  deleteUserFromFirestore(id: string) {
    const docInstance = doc(this.firestore, this.userInstanceName, id);
    return deleteDoc(docInstance);
  }

  async getSpecificUserFromFirestore(searchString: string) {
    const q = query(
      collection(this.firestore, this.userInstanceName),
      where('userName', '>=', searchString),
      where('userName', '<', searchString + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    const userList: User[] = querySnapshot.docs.map(
      (doc) => doc.data() as User
    );
    return userList;
  }
  
  getUniqueId() {
    return this.uniqueId$;
  }

  updateUniqueId(uniqueIdDetails: any) {
    const docInstance = doc(this.firestore, this.uniqueIdInstanceName, uniqueIdDetails.id);
    updateDoc(docInstance, {uniqueId: uniqueIdDetails.uniqueId});
  }
}
