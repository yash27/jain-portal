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
  doc,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class HomeService {

  private readonly userInstanceName: string = 'users';
  private readonly foodPreferenceUniqueIdInstanceName: string = 'foodPreferenceUniqueId';
  private readonly nonFoodPreferenceUniqueIdInstanceName: string = 'nonFoodPreferenceUniqueId';
  private readonly adminLoginsInstanceName: string = 'adminUsers';

  private userCollectionInstance = collection(this.firestore, this.userInstanceName);
  private foodPreferenceUniqueIdCollectionInstance = collection(this.firestore, this.foodPreferenceUniqueIdInstanceName);
  private nonFoodPreferenceUniqueIdCollectionInstance = collection(this.firestore, this.nonFoodPreferenceUniqueIdInstanceName);
  private adminLoginsCollectionInstance = collection(this.firestore, this.adminLoginsInstanceName);
   
  private customQuery = query(this.userCollectionInstance, orderBy('uniqueId'));

  users$ = collectionData(this.customQuery, {idField: 'id'}) as Observable<User[]>;
  foodPreferenceUniqueId$ = collectionData(this.foodPreferenceUniqueIdCollectionInstance, {idField: 'id'}) as Observable<any>;
  nonFoodPreferenceUniqueId$ = collectionData(this.nonFoodPreferenceUniqueIdCollectionInstance, {idField: 'id'}) as Observable<any>;
  adminLogins$ = collectionData(this.adminLoginsCollectionInstance, {idField: 'id'}) as Observable<any>;

  uniqueIdDetails: any = {};

  constructor(private firestore: Firestore) {}

  adminUsersList: any = [];

  fetchUsersFromFirestore() {
    return this.users$;
  }

  fetchAndStoreUniqueId() {
    this.getFoodPreferenceUniqueId().subscribe((uniqueIdDetails) => {
      if (uniqueIdDetails && uniqueIdDetails.length > 0) {
        this.uniqueIdDetails.foodPreferenceUniqueId = uniqueIdDetails[0];
      }
    });
    this.getNonFoodPreferenceUniqueId().subscribe((uniqueIdDetails) => {
      if (uniqueIdDetails && uniqueIdDetails.length > 0) {
        this.uniqueIdDetails.nonFoodPreferenceUniqueId = uniqueIdDetails[0];
      }
    });
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

  async getSpecificUserFromFirestore(searchString: any) {
    let q: any;
    if(isNaN(searchString)) {
      q = query(
        collection(this.firestore, this.userInstanceName),
        where('userName', '>=', searchString),
        where('userName', '<', searchString + '\uf8ff')
      );
    } else {
      q = query(
        collection(this.firestore, this.userInstanceName),
        where('uniqueId', '==', Number(searchString))
      );
    }
    const querySnapshot = await getDocs(q);
    const userList: User[] = querySnapshot.docs.map(
      (doc) => doc.data() as User
    );
    return userList;
  }

  getFoodPreferenceUniqueId() {
    return this.foodPreferenceUniqueId$;
  }

  getNonFoodPreferenceUniqueId() {
    return this.nonFoodPreferenceUniqueId$;
  }

  updateUniqueId(uniqueIdDetails: any, preference: string) {
    let docInstance;
    preference === 'food' ? docInstance = doc(this.firestore, this.foodPreferenceUniqueIdInstanceName, uniqueIdDetails.id) : docInstance = doc(this.firestore, this.nonFoodPreferenceUniqueIdInstanceName, uniqueIdDetails.id);
    updateDoc(docInstance, {uniqueId: uniqueIdDetails.uniqueId});
  }
}
