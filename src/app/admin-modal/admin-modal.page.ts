import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { HomeService } from '../home/home-service';

@Component({
  selector: 'app-admin-modal',
  templateUrl: './admin-modal.page.html',
  styleUrls: ['./admin-modal.page.scss'],
})
export class AdminModalPage implements OnInit {

  segmentTabValue: string = "users";
  users: any = [];
  loggedInUser: any = {
    adminId: "yash",
    password: "123",
    superUser: true,
    id: "DIf0YJhlpx5fK9TkWl25"
  };
  userSearchKeyword: string = '';

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private service: HomeService
  ) { }

  ngOnInit() {
    this.fetchAllUsers();
  }

  fetchAllUsers() {
    this.service.fetchUsersFromFirestore().subscribe(users => {
      this.users = users;
    })
  }

  onTabChange(event: any) {
    this.segmentTabValue = event.detail.value
  }

  async onUserSearch() {
    this.users = await this.service.getSpecificUserFromFirestore(this.userSearchKeyword);
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
                // Do Something when user is deleted
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

}
