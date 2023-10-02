import { Component } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { HomeService } from './home-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from './user.interface';
import { AdminModalPage } from '../admin-modal/admin-modal.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  userForm = this.fb.group({
    address: ['', Validators.required],
    usersCount: [0, Validators.required],
    userName: ['', Validators.required],
    age: ['', Validators.required],
    foodPreference: ['', Validators.required],
    mobileNumber: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
    stayPreference: ['', Validators.required],
  });
  uniqueIdDetails: any = {};
  usersCountSelectValue: number[] = [];

  constructor(
    private platform: Platform,
    private service: HomeService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    this.setUsersCountSelectValue();
    this.getDeviceSize();
  }

  setUsersCountSelectValue(): void {
    for(let i = 0 ; i <= 10 ; i++) {
      this.usersCountSelectValue.push(i);
    }
  }

  ngOnInit() {
    this.fetchAndStoreUniqueId();
    this.service.fetchAdminLoginsFromFirestore();
    this.openAdminPanelModal({
      adminId: "yash",
      password: "123",
      superUser: true,
      id: "DIf0YJhlpx5fK9TkWl25"
    });
  }

  fetchAndStoreUniqueId() {
    this.service.getUniqueId().subscribe(uniqueIdDetails => {
      if(uniqueIdDetails && uniqueIdDetails.length > 0) {
        this.uniqueIdDetails = uniqueIdDetails[0];
      }
    });
  }

  getDeviceSize(): number {
    let colSize = 0,
      width = this.platform.width();
    if (width > 480 && width < 767) {
      colSize = 2;
    } else if (width > 768) {
      colSize = 3;
    }
    return colSize;
  }

  updateUniqueId(isReset: boolean) {
    isReset ? this.uniqueIdDetails.uniqueId = 1000 : this.uniqueIdDetails.uniqueId++;
    this.service.updateUniqueId(this.uniqueIdDetails);
  }

  submitForm() {
    let user: User = {
      uniqueId: this.uniqueIdDetails.uniqueId,
      usersCount: this.userForm.value.usersCount,
      address: this.userForm.value.address,
      age: Number(this.userForm.value.age),
      userName: this.userForm.value.userName?.toLowerCase(),
      mobileNumber: Number(this.userForm.value.mobileNumber),
      foodPreference: (this.userForm.value.foodPreference === "true"),
      stayPreference: (this.userForm.value.stayPreference === "true")
    }
    this.service.addUserInFirestore(user).then(success => {
      this.updateUniqueId(false);
      this.alertController.create(
        {
          header: 'जानकारी',
          message: 'आपकी जानकारी सफलतापूर्वक जुड़ गई है, आपका रजिस्ट्रेशन नंबर व्हाट्सएप पर दिखाई देगा, व्हाट्सएप खोलने के लिए ओके पर क्लिक करें और सेंड बटन पर क्लिक करें',
          buttons: [
            {
              text: 'Ok',
              role: 'ok',
              handler: () => {
                this.userForm.reset();
                this.openWhatsappChat(user);
              }
            }
          ]
        }
      ).then(alert => alert.present());
    }).catch(error => {
      this.alertController.create(
        {
          header: 'जानकारी',
          message: 'आपकी जानकारी अभी नहीं जोड़ी गई है, कृपया कुछ समय बाद प्रयास करें',
          buttons: [
            {
              text: 'Ok',
              role: 'ok'
            }
          ]
        }
      ).then(alert => alert.present());

    });
  }

  openWhatsappChat(userDetails: User) {
    const phoneNumber = 9039250241;
    const message = 'आपका रजिस्ट्रेशन सफलतापूर्वक हो गया है, आपकी रजिस्ट्रेशन नंबर ' + userDetails.uniqueId + ' है. धन्यवाद';
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  }

  openAdminPanel() {
    this.alertController.create(
      {
        header: 'Admin Login',
        subHeader: 'Please enter Admin ID and Password',
        mode: 'ios',
        inputs: [
          {
            type: 'text',
            label: 'Admin ID',
            name: 'adminId',
            placeholder: 'Enter Admin ID'
          },
          {
            type: 'password',
            label: 'Admin Password',
            name: 'password',
            placeholder: 'Enter Admin Password'
          }
        ],
        buttons: [
          {
            text: 'Ok',
            cssClass: 'adminPanelAlertBtns',
            handler: (adminCredentials) => {
              const loggedIdUser = this.service.adminUsersList.find((admin: any) => admin.adminId === adminCredentials.adminId && admin.password === adminCredentials.password);
              if(loggedIdUser) {
                this.openAdminPanelModal(loggedIdUser);
              } else {
                this.alertController.create(
                  {
                    header: 'Message',
                    message: 'Invalid Credentials',
                    buttons: [
                      {
                        text: 'Ok',
                        role: 'cancel'
                      }
                    ]
                  }
                ).then(alert => alert.present());
              }
            }
          },
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'adminPanelAlertBtns',
          }
        ]
      }
    ).then(alert => alert.present());
  }

  openAdminPanelModal(loggedIdUser: any) {
    this.modalController.create(
      {
        component: AdminModalPage,
        componentProps: {
          loggedInUser: loggedIdUser
        }
      }
    ).then(modal => modal.present());
  }

  clearForm() {
    this.userForm.reset();
  }

  consoleClearLog(data: any) {
    console.clear();
    console.log(data);
  }
}
