# SWDev-hotel-reservation
This repository is final project for course 2110503 Software Development Practice 2/2022.

The system is a hotel booking system which allows the registered user to book up to 3 nights by specifying the date and the preferred hotel.


Multiple diagrams are presented here:
- ER diagram: https://drive.google.com/file/d/1gRR3IDJVzImXyEGdrfJw-dsvJ4h3bcMM/view?usp=sharing

Import Data from .csv to MongoDB atlas script:
./mongoimport --uri mongodb+srv://SWDevHotel:SWDevHotel@swdevhotel.fo0sp1b.mongodb.net/SWDevHotel --collection hotels --type csv --file hotel_collection_clean.csv --headerline

สิ่งที่แก้จาก code เดิม
1.	เปลี่ยน hospital เป็น hotel, เปลี่ยน appointment เป็น booking
2.	เพิ่ม field ใน model Hotel รวมถึงแก้ ER diagram ในส่วนนี้
3.	ใช้ Outscraper scrape data hotel ใน Bangkok มา 500 data แล้ว import ไป excel แล้วเอา .csv file import เข้า MongoDB โดย mongoimport command
4.	เพิ่ม field leaveDate ใน model Booking + แก้ ER
5.	add logic ให้ duration การจองไม่เกิน 3 วันและอย่างน้อย 1 วัน
6.  feature review โดยมีทั้ง score และ description โดย score จะไปแสดงเป็นค่าเฉลี่ยที่ collection hotel