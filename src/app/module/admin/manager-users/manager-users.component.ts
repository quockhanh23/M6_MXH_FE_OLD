import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../../services/admin.service";
import {User} from "../../../models/user";

@Component({
  selector: 'app-manager-users',
  templateUrl: './manager-users.component.html',
  styleUrls: ['./manager-users.component.css']
})
export class ManagerUsersComponent implements OnInit {
  user?: User[]
  count?: any

  constructor(private adminService: AdminService) {
  }

  ngOnInit(): void {
    this.getAll()
  }

  getAll() {
    this.adminService.getAll().subscribe(rs => {
      // console.log("Kiểu dữ liệu: " + JSON.stringify(rs))
      this.user = rs
      this.count = rs.length
    })
  }
}
