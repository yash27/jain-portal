import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { HomeService } from '../home/home-service';
import { User } from '../home/user.interface';
import { HomePage } from '../home/home.page';
import { Constants } from '../home/constants';

@Component({
  selector: 'app-admin-modal',
  templateUrl: './admin-modal.page.html',
  styleUrls: ['./admin-modal.page.scss'],
})
export class AdminModalPage implements OnInit {

  segmentTabValue: string = "users";
  users: any[] = [];
  loggedInUser: any = {};
  // Enable this user for testing
  // loggedInUser: any = {
  //   adminId: "yash",
  //   password: "123",
  //   superUser: true,
  //   id: "DIf0YJhlpx5fK9TkWl25"
  // };
  userSearchKeyword: string = '';
  segUsers: any = {
    withFoodPreference: [],
    withoutFoodPreference: []
  }
  isFoodPreferenceSelectedForView: boolean = true;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private service: HomeService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.fetchAllUsers();
  }

  fetchAllUsers() {
    this.service.fetchUsersFromFirestore().subscribe(users => {
      this.users = users;
      this.segregateUsersBasedOnFoodPreference(this.users);
    })
  }

  segregateUsersBasedOnFoodPreference(users: User[]) {
    this.segUsers.withFoodPreference = users.filter(user => user.foodPreference === true);
    this.segUsers.withoutFoodPreference = users.filter(user => user.foodPreference === false);
    console.clear();
    console.log(this.segUsers);
  }

  onTabChange(event: any) {
    this.segmentTabValue = event.detail.value
  }

  onFoodPreferenceChange(event: any) {
    this.isFoodPreferenceSelectedForView = (event.detail.value === 'true');
  }

  async onUserSearch() {
    this.users = await this.service.getSpecificUserFromFirestore(this.userSearchKeyword);
    this.segregateUsersBasedOnFoodPreference(this.users);
  }

  deleteUser(id: string) {
    this.alertController.create(
      {
        header: 'Warning',
        message: 'Are you sure you want to delete this user?',
        buttons: [
          {
            text: 'Cancel',
            cssClass: 'adminPanelAlertBtns',
            role: 'cancel'
          },
          {
            text: 'Delete',
            cssClass: 'adminPanelAlertBtns',
            handler: () => {
              this.service.deleteUserFromFirestore(id).then(response => {
                this.showToastMessage('User Deleted Successfully');
              });
            }
          }
        ]
      }
    ).then(alert => alert.present());
  }

  resetUsersList() {
    this.fetchAllUsers();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  deleteAllUsersDialog() {
    this.alertController.create(
      {
        header: 'Warning',
        message: 'Are you sure, you want to delete all users from the database?',
        buttons: [
          {
            text: 'Cancel',
            cssClass: 'adminPanelAlertBtns',
            role: 'cancel'
          },
          {
            text: 'Delete',
            cssClass: 'adminPanelAlertBtns',
            handler: () => {
              this.deleteAllUsers();
            }
          }
        ]
      }
    ).then(alert => alert.present());
  }

  deleteAllUsers() {
    this.users.forEach(user => {
      this.service.deleteUserFromFirestore(user.id);
    });
  }
    

  showToastMessage(msg: string) {
    this.toastController.create(
      {
        message: msg,
        duration: 2000
      }
    ).then(toast => toast.present());
  }

  resetUniqueId(preference: string) {
    this.alertController.create(
      {
        header: 'Warning',
        message: 'Are you sure you want to reset the count',
        buttons: [
          {
            text: 'Cancel',
            cssClass: 'adminPanelAlertBtns',
            role: 'cancel'
          },
          {
            text: 'Reset',
            cssClass: 'adminPanelAlertBtns',
            handler: () => {
              if(preference === 'food') {
                this.service.uniqueIdDetails.foodPreferenceUniqueId.uniqueId = Constants.FOOD_PREFERENCE_UNIQUE_ID_CONSTANT;
                this.service.updateUniqueId(this.service.uniqueIdDetails.foodPreferenceUniqueId, 'food');
              } else {
                this.service.uniqueIdDetails.nonFoodPreferenceUniqueId.uniqueId = Constants.NON_FOOD_PREFERENCE_UNIQUE_ID_CONSTANT;
                this.service.updateUniqueId(this.service.uniqueIdDetails.nonFoodPreferenceUniqueId, 'nonFood');
              }
            }
          }
        ]
      }
    ).then(alert => alert.present());
  }

}
